import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

const proxyQuerySchema = z.object({
  url: z.string().min(1, "URL is required"),
});

function normalizeTargetUrl(rawUrl: string): string {
  if (!/^https?:\/\//i.test(rawUrl)) {
    return `https://${rawUrl}`;
  }
  return rawUrl;
}

function rewriteHtml(html: string, targetUrl: string): string {
  const baseUrl = new URL(targetUrl);
  const proxyPrefix = "/api/proxy?url=";

  const rewriteAttribute = (value: string) => {
    if (value.startsWith("#") || value.startsWith("data:") || value.startsWith("mailto:")) {
      return value;
    }
    try {
      const absolute = new URL(value, baseUrl).toString();
      return `${proxyPrefix}${encodeURIComponent(absolute)}`;
    } catch {
      return value;
    }
  };

  const attributeRegex = /\s(?:href|src|action)=["']([^"']+)["']/gi;
  let rewritten = html.replace(attributeRegex, (match, value) =>
    match.replace(value, rewriteAttribute(value))
  );

  const srcsetRegex = /\ssrcset=["']([^"']+)["']/gi;
  rewritten = rewritten.replace(srcsetRegex, (match, value) => {
    const rewrittenSrcset = value
      .split(",")
      .map((part) => {
        const [url, descriptor] = part.trim().split(/\s+/, 2);
        const rewrittenUrl = rewriteAttribute(url);
        return descriptor ? `${rewrittenUrl} ${descriptor}` : rewrittenUrl;
      })
      .join(", ");
    return match.replace(value, rewrittenSrcset);
  });

  return rewritten.replace(
    /<head([^>]*)>/i,
    `<head$1><base href="${baseUrl.toString()}">`
  );
}

function rewriteCss(css: string, targetUrl: string): string {
  const baseUrl = new URL(targetUrl);
  const proxyPrefix = "/api/proxy?url=";
  return css.replace(/url\(([^)]+)\)/gi, (match, value) => {
    const cleaned = value.trim().replace(/^['"]|['"]$/g, "");
    if (!cleaned || cleaned.startsWith("data:") || cleaned.startsWith("#")) {
      return match;
    }
    try {
      const absolute = new URL(cleaned, baseUrl).toString();
      return `url("${proxyPrefix}${encodeURIComponent(absolute)}")`;
    } catch {
      return match;
    }
  });
}

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

  app.get("/api/proxy", isAuthenticated, async (req, res) => {
    const parsed = proxyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.errors[0].message,
        field: parsed.error.errors[0].path.join("."),
      });
    }

    const targetUrl = normalizeTargetUrl(parsed.data.url);
    let response: Response;
    try {
      response = await fetch(targetUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": req.headers["user-agent"] ?? "Code-Linker Proxy",
        },
      });
    } catch (error) {
      console.error("Proxy fetch failed:", error);
      return res.status(502).json({ message: "Proxy fetch failed" });
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");

    if (contentType.includes("text/html")) {
      const html = await response.text();
      res.status(response.status).send(rewriteHtml(html, targetUrl));
      return;
    }

    if (contentType.includes("text/css")) {
      const css = await response.text();
      res.status(response.status).send(rewriteCss(css, targetUrl));
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(response.status).send(buffer);
  });

  // Seed function (optional, but good for testing)
  // We can't easily seed per-user data without a user ID, 
  // so we'll skip global seeding for now or do it on first login if needed.

  return httpServer;
}
