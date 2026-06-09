import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    // Perform upsert to ensure concurrent requests safely fetch/insert the user
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to fetch or create user in Cloud SQL:", error);
    throw new Error("User database synchronization failed.", { cause: error });
  }
}
