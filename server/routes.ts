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

      const withAuthors = await Promise.all(
        msgs.map(async (m) => {
          let authorName = undefined;
          let authorImage = undefined;

          if (m.authorId && m.type !== "sin") {
            const user = await authStorage.getUser(m.authorId);
            authorName = user?.firstName
              ? `${user.firstName} ${user.lastName || ""}`.trim()
              : user?.email?.split("@")[0] || "Unknown";
            authorImage = user?.profileImageUrl;
          }

          return { ...m, authorName, authorImage };
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

  await seedDatabase();

  return httpServer;
}
