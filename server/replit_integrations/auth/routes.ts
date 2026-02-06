import type { Express } from "express";
import { authStorage } from "./storage";
import { storage } from "../../storage";
import { isAuthenticated, sanitizeUser } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.delete("/api/account/purge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteSessionsByUser(userId);
      await authStorage.deleteUser(userId);
      req.logout(() => {
        req.session?.destroy(() => {
          res.status(204).send();
        });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user data" });
    }
  });
}
