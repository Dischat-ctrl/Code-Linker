import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Proxy Sessions API
  app.get(api.proxy.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const sessions = await storage.getSessions(userId);
    res.json(sessions);
  });

  app.post(api.proxy.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.proxy.create.input.parse(req.body);
      // Force userId from auth
      const sessionData = {
        ...input,
        userId: (req.user as any).id,
      };
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.proxy.delete.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    await storage.deleteSession(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Seed function (optional, but good for testing)
  // We can't easily seed per-user data without a user ID, 
  // so we'll skip global seeding for now or do it on first login if needed.

  return httpServer;
}
