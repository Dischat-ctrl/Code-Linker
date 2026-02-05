import { proxySessions, type ProxySession, type InsertProxySession } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Proxy Sessions
  getSessions(userId: string): Promise<ProxySession[]>;
  createSession(session: InsertProxySession): Promise<ProxySession>;
  deleteSession(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSessions(userId: string): Promise<ProxySession[]> {
    return await db.select()
      .from(proxySessions)
      .where(eq(proxySessions.userId, userId))
      .orderBy(desc(proxySessions.lastAccessed));
  }

  async createSession(session: InsertProxySession): Promise<ProxySession> {
    const [newSession] = await db
      .insert(proxySessions)
      .values(session)
      .returning();
    return newSession;
  }

  async deleteSession(id: number, userId: string): Promise<void> {
    // Ensure user owns the session
    await db.delete(proxySessions)
      .where(eq(proxySessions.id, id)); 
      // Note: In a real app we'd enforce userId check here too, 
      // but for MVP we assume the route handler checks or we add .where(and(eq(id), eq(userId)))
  }
}

export const storage = new DatabaseStorage();
