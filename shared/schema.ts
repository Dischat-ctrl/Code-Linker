export * from "./models/auth";
import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const proxySessions = pgTable("proxy_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users.id
  url: text("url").notNull(),
  title: text("title"),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertProxySessionSchema = createInsertSchema(proxySessions).omit({ 
  id: true, 
  lastAccessed: true 
});

export type InsertProxySession = z.infer<typeof insertProxySessionSchema>;
export type ProxySession = typeof proxySessions.$inferSelect;
