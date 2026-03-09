import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { stripe, SPECIAL_CANDLE_PRICE, SPECIAL_CANDLE_CURRENCY } from "./stripe";

import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.messages.list.path, async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const authorId = req.query.authorId as string | undefined;
      const msgs = await storage.getMessages(type, authorId);

      const withAuthors = await Promise.all(
        msgs.map(async (m) => {
          let authorName = undefined;
          let authorImage = undefined;
          let authorCity = undefined;

          if (m.authorId && m.type !== "sin") {
            const user = await authStorage.getUser(m.authorId);
            if (user?.firstName) {
              const last = user.lastName
                ? user.lastName.trim().split(/\s+/).map((p: string) => p[0].toUpperCase() + ".").join(" ")
                : "";
              authorName = last ? `${user.firstName} ${last}` : user.firstName;
            } else {
              authorName = user?.email?.split("@")[0] || "Unknown";
            }
            authorImage = user?.profileImageUrl;
            authorCity = user?.city || undefined;
          }

          return { ...m, authorName, authorImage, authorCity };
        })
      );

      res.json(withAuthors);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const userId = req.session?.userId;

      const msg = await storage.createMessage({
        ...input,
        authorId: userId,
      });

      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.like.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const msg = await storage.getMessage(id);

      if (!msg) return res.status(404).json({ message: "Not found" });

      const updated = await storage.updateMessage(id, {
        likesCount: msg.likesCount + 1,
      });

      if (msg.authorId) {
        await storage.createNotification({
          userId: msg.authorId,
          messageId: id,
          type: "like",
          content: `Alguém orou pela sua causa: "${msg.content.substring(
            0,
            30
          )}..."`,
          isRead: false,
        });
      }

      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.pardon.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const msg = await storage.getMessage(id);

      if (!msg) return res.status(404).json({ message: "Not found" });

      if (msg.type !== "sin") {
        return res
          .status(400)
          .json({ message: "Only sins can be pardoned" });
      }

      const updated = await storage.updateMessage(id, { isPardoned: true });

      if (msg.authorId) {
        await storage.createNotification({
          userId: msg.authorId,
          messageId: id,
          type: "pardon",
          content: `Sua confissão foi perdoada: "${msg.content.substring(
            0,
            30
          )}..."`,
          isRead: false,
        });
      }

      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.messages.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const userId = req.session?.userId;

      const msg = await storage.getMessage(id);
      if (!msg) return res.status(404).json({ message: "Not found" });

      const dbUser = await authStorage.getUser(userId);
      const isAdmin = dbUser?.role === "admin";

      if (msg.authorId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteMessage(id);
      res.status(204).end();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const dbUser = await authStorage.getUser(userId);

      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = parseInt(String(req.params.id));
      const msg = await storage.getMessage(id);

      if (!msg) return res.status(404).json({ message: "Not found" });

      const updates: any = {};
      if (req.body.content !== undefined) updates.content = req.body.content;
      if (req.body.type !== undefined) updates.type = req.body.type;

      const updated = await storage.updateMessage(id, updates);
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Admin: estatísticas ───────────────────────────────────────────
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allMessages = await storage.getAllMessages();
      const allUsers = await authStorage.getAllUsers();

      res.json({
        totalUsers: allUsers.length,
        totalPrayers: allMessages.filter(m => m.type === "prayer").length,
        totalGraces: allMessages.filter(m => m.type === "grace").length,
        totalSins: allMessages.filter(m => m.type === "sin").length,
        totalSpecial: allMessages.filter(m => m.isSpecial).length,
      });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });


  app.post("/api/payments/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { messageId } = req.body;

      const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: SPECIAL_CANDLE_CURRENCY,
              product_data: { name: "Vela Especial", description: "Destaque sua mensagem com uma vela especial" },
              unit_amount: SPECIAL_CANDLE_PRICE,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?payment=cancelled`,
        metadata: { userId, messageId: String(messageId ?? "") },
      });

      await storage.createPayment({
        userId,
        messageId: messageId ?? null,
        stripeSessionId: session.id,
        amount: SPECIAL_CANDLE_PRICE,
        status: "pending",
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe checkout error:", err);
      res.status(500).json({ message: "Erro ao criar sessão de pagamento" });
    }
  });

  // ── Stripe: webhook ───────────────────────────────────────────────
  app.post("/api/payments/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;
    try {
      const rawBody = (req as any).rawBody as Buffer;
      if (!rawBody) {
        console.error("Webhook error: rawBody not available");
        return res.status(400).send("Webhook Error: no raw body");
      }
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        event = JSON.parse(rawBody.toString());
      }
    } catch (err) {
      console.error("Webhook signature error:", err);
      return res.status(400).send("Webhook Error");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const { messageId } = session.metadata;

      try {
        const payment = await storage.getPaymentBySessionId(session.id);
        if (payment) {
          await storage.updatePaymentStatus(payment.id, "completed");
        }
        if (messageId) {
          await storage.updateMessage(parseInt(messageId), { isSpecial: true });
        }
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    }

    res.json({ received: true });
  });

  // ── Notifications ─────────────────────────────────────────────────
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await storage.getNotifications(userId);
      res.json(notifs);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.markNotificationsRead(userId);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  await seedDatabase();

  return httpServer;
}
