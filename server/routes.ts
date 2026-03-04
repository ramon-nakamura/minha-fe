import type { Express } from "express";
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
      
      const withAuthors = await Promise.all(msgs.map(async (m) => {
        let authorName = undefined;
        let authorImage = undefined;
        if (m.authorId && m.type !== 'sin') {
          const user = await authStorage.getUser(m.authorId);
          authorName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'Unknown';
          authorImage = user?.profileImageUrl;
        }
        return { ...m, authorName, authorImage };
      }));
      
      res.json(withAuthors);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const userId = req.session?.userId;
      
      const msg = await storage.createMessage({
        ...input,
        authorId: input.type === 'sin' ? null : userId,
      });
      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.like.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const msg = await storage.getMessage(id);
      if (!msg) {
        return res.status(404).json({ message: "Not found" });
      }
      
      const updated = await storage.updateMessage(id, { likesCount: msg.likesCount + 1 });
      
      if (msg.authorId) {
        await storage.createNotification({
          userId: msg.authorId,
          messageId: id,
          type: 'like',
          content: `Alguém orou pela sua causa: "${msg.content.substring(0, 30)}..."`,
          isRead: false
        });
      }
      
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.pardon.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const msg = await storage.getMessage(id);
      if (!msg) {
        return res.status(404).json({ message: "Not found" });
      }
      if (msg.type !== 'sin') {
        return res.status(400).json({ message: "Only sins can be pardoned" });
      }
      
      const updated = await storage.updateMessage(id, { isPardoned: true });
      
      if (msg.authorId) {
        await storage.createNotification({
          userId: msg.authorId,
          messageId: id,
          type: 'pardon',
          content: `Sua confissão foi perdoada: "${msg.content.substring(0, 30)}..."`,
          isRead: false
        });
      }
      
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.messages.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
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
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.deleteBulk.path, isAuthenticated, async (req: any, res) => {
    try {
      const { ids } = api.messages.deleteBulk.input.parse(req.body);
      const userId = req.session?.userId;
      
      const dbUser = await authStorage.getUser(userId);
      const isAdmin = dbUser?.role === "admin";
      
      if (!isAdmin) {
        for (const id of ids) {
          const msg = await storage.getMessage(id);
          if (msg && msg.authorId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
          }
        }
      }
      
      await storage.deleteMessages(ids);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allUsers = await authStorage.getAllUsers();
      const allMessages = await storage.getAllMessages();

      const totalUsers = allUsers.length;
      const totalPrayers = allMessages.filter(m => m.type === "prayer").length;
      const totalGraces = allMessages.filter(m => m.type === "grace").length;
      const totalSins = allMessages.filter(m => m.type === "sin").length;
      const totalSpecial = allMessages.filter(m => m.isSpecial).length;

      res.json({ totalUsers, totalPrayers, totalGraces, totalSins, totalSpecial });
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const adminMessageSchema = z.object({
    content: z.string().min(1, "Conteúdo não pode estar vazio").max(400).optional(),
    type: z.enum(["prayer", "grace", "sin"]).optional(),
  }).refine(data => data.content || data.type, { message: "At least one field required" });

  app.patch("/api/admin/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const id = parseInt(req.params.id);
      const msg = await storage.getMessage(id);
      if (!msg) return res.status(404).json({ message: "Not found" });
      
      const parsed = adminMessageSchema.parse(req.body);
      const updates: any = {};
      if (parsed.content !== undefined) updates.content = parsed.content;
      if (parsed.type !== undefined) updates.type = parsed.type;
      
      const updated = await storage.updateMessage(id, updates);
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const notifs = await storage.getNotifications(userId);
      res.json(notifs);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      await storage.markNotificationsRead(userId);
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payments/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { messageId } = req.body;

      if (!messageId) {
        return res.status(400).json({ message: "messageId is required" });
      }

      const msg = await storage.getMessage(messageId);
      if (!msg) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (msg.authorId !== userId) {
        return res.status(403).json({ message: "Not your message" });
      }
      if (msg.type !== "prayer") {
        return res.status(400).json({ message: "Only prayers can have special candles" });
      }
      if (msg.isSpecial) {
        return res.status(400).json({ message: "This prayer already has a special candle" });
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: SPECIAL_CANDLE_CURRENCY,
              product_data: {
                name: "Vela Especial",
                description: "Destaque sua oração com uma vela especial",
              },
              unit_amount: SPECIAL_CANDLE_PRICE,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?payment=cancelled`,
        metadata: {
          userId,
          messageId: String(messageId),
        },
      });

      await storage.createPayment({
        userId,
        messageId,
        stripeSessionId: session.id,
        amount: SPECIAL_CANDLE_PRICE,
        status: "pending",
      });

      res.json({ url: session.url });
    } catch (e) {
      console.error("Checkout error:", e);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/payments/success", async (req: any, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.redirect("/?payment=error");
      }

      const payment = await storage.getPaymentBySessionId(sessionId);
      if (!payment) {
        return res.redirect("/?payment=error");
      }

      if (payment.status === "completed") {
        return res.redirect("/?payment=success");
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        if (payment.messageId) {
          const msg = await storage.getMessage(payment.messageId);
          if (msg && msg.authorId === payment.userId) {
            await storage.updateMessage(payment.messageId, { isSpecial: true });
          }
        }
        await storage.updatePaymentStatus(payment.id, "completed");
        return res.redirect("/?payment=success");
      }

      res.redirect("/?payment=pending");
    } catch (e) {
      console.error("Payment success error:", e);
      res.redirect("/?payment=error");
    }
  });

  app.post("/api/payments/webhook", async (req: any, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn("STRIPE_WEBHOOK_SECRET not set — skipping webhook processing");
        return res.json({ received: true });
      }

      if (!sig || !req.rawBody) {
        return res.status(400).json({ message: "Missing signature or raw body" });
      }

      const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const stripeSessionId = session.id;

        const payment = await storage.getPaymentBySessionId(stripeSessionId);
        if (payment && payment.status === "pending" && payment.messageId) {
          const msg = await storage.getMessage(payment.messageId);
          if (msg && msg.authorId === payment.userId) {
            await storage.updateMessage(payment.messageId, { isSpecial: true });
            await storage.updatePaymentStatus(payment.id, "completed");
          }
        }
      }

      res.json({ received: true });
    } catch (e) {
      console.error("Webhook error:", e);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  app.get("/api/payments/config", (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  });

  await seedDatabase();

  return httpServer;
}
