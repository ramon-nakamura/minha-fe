import type { Express, Request, Response, NextFunction } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await authStorage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, profileImageUrl } = req.body;
      const user = await authStorage.updateUser(userId, { firstName, lastName, profileImageUrl });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await authStorage.getAllUsers();
      const safeUsers = allUsers.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (role === "user") {
        const allUsers = await authStorage.getAllUsers();
        const adminCount = allUsers.filter(u => u.role === "admin").length;
        const targetUser = allUsers.find(u => u.id === id);
        if (targetUser?.role === "admin" && adminCount <= 1) {
          return res.status(400).json({ message: "Cannot remove the last admin" });
        }
      }
      const user = await authStorage.updateUser(id, { role });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.session.userId;
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      await authStorage.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, firstName, lastName, role } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("changeme123", 10);
      const user = await authStorage.upsertUser({
        id: `manual-${Date.now()}`,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || "user",
      });
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
}
