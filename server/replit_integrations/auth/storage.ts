import { users, type User, type UpsertUser } from "@shared/models/auth";
import crypto from "crypto";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    await db.delete(users).where(eq(users.id, id));
  }
}

class MemoryAuthStorage implements IAuthStorage {
  private users = new Map<string, User>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const id = userData.id ?? crypto.randomUUID();
    const user: User = {
      id,
      email: userData.email ?? "",
      passwordHash: userData.passwordHash ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: userData.createdAt ?? new Date(),
      updatedAt: userData.updatedAt ?? new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id ?? crypto.randomUUID();
    const existing = this.users.get(id);
    const user: User = {
      id,
      email: userData.email ?? existing?.email ?? "",
      passwordHash: userData.passwordHash ?? existing?.passwordHash ?? null,
      firstName: userData.firstName ?? existing?.firstName ?? null,
      lastName: userData.lastName ?? existing?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null,
      createdAt: existing?.createdAt ?? userData.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }
}

export const authStorage = db ? new AuthStorage() : new MemoryAuthStorage();
