import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: Partial<InsertUser> = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    // All possible user fields from schema
    const fields = [
      "name", "email", "phone", "avatarUrl", 
      "loginMethod", "moneyPersonality", "monthlyIncomeRange",
      "subscriptionTier", "role"
    ] as const;

    fields.forEach((field) => {
      const value = user[field as keyof InsertUser];
      if (value !== undefined) {
        values[field as keyof InsertUser] = value as any;
        updateSet[field] = value;
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    if (values.role === undefined && user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values as any).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function updateUser(openId: string, data: Partial<InsertUser>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.openId, openId));
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Permanently delete a user and all associated data.
 * This should be used for the "Delete Account" feature.
 */
export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for account deletion");
  }

  // Import schemas for all tables to clean up
  const { 
    expenses, savingsGoals, savingsDeposits, debts, investments,
    communityPosts, communityComments, ritualCompletions, bills,
    ajoMembers, ajoContributions, ajoCircles, ajoMessages
  } = await import("../drizzle/schema");

  await db.transaction(async (tx) => {
    // 1. Delete user-specific data from all tables
    // Note: We use the userId (integer) for these deletions
    await tx.delete(expenses).where(eq(expenses.userId, userId));
    await tx.delete(savingsGoals).where(eq(savingsGoals.userId, userId));
    await tx.delete(savingsDeposits).where(eq(savingsDeposits.userId, userId));
    await tx.delete(debts).where(eq(debts.userId, userId));
    await tx.delete(investments).where(eq(investments.userId, userId));
    await tx.delete(communityPosts).where(eq(communityPosts.userId, userId));
    await tx.delete(communityComments).where(eq(communityComments.userId, userId));
    await tx.delete(ritualCompletions).where(eq(ritualCompletions.userId, userId));
    await tx.delete(bills).where(eq(bills.userId, userId));
    await tx.delete(ajoMembers).where(eq(ajoMembers.userId, userId));
    await tx.delete(ajoContributions).where(eq(ajoContributions.userId, userId));
    await tx.delete(ajoMessages).where(eq(ajoMessages.userId, userId));

    // 2. Handle Ajo Circles created by the user
    // If you are the creator, the circle is deleted
    await tx.delete(ajoCircles).where(eq(ajoCircles.creatorId, userId));

    // 3. Finally, delete the user record
    await tx.delete(users).where(eq(users.id, userId));
  });
}

// TODO: add feature queries here as your schema grows.
