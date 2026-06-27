import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { logServerError } from "@/lib/errors";

const databaseSetupMessage =
  "Database schema may be out of sync. Run npm run db:push.";
const inactiveAccountMessage =
  "Your account is not active. Please contact an administrator.";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let user;

  try {
    user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
  } catch (error) {
    logServerError("auth.getCurrentUser.lookup", error);
    throw new Error(databaseSetupMessage);
  }

  if (user) {
    return user;
  }

  try {
    return await syncCurrentUser();
  } catch (error) {
    logServerError("auth.getCurrentUser.sync", error);
    throw error instanceof Error && error.message === "User email not found"
      ? error
      : new Error(databaseSetupMessage);
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.status !== "active") {
    throw new Error(inactiveAccountMessage);
  }

  return user;
}

export async function syncCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found");
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
    });

    if (existingUser) {
      return existingUser;
    }

    const existingUserByEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUserByEmail) {
      const [updatedUser] = await db
        .update(users)
        .set({
          clerkId: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            existingUserByEmail.name ||
            email.split("@")[0],
          imageUrl: clerkUser.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUserByEmail.id))
        .returning();

      return updatedUser;
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || email.split("@")[0],
        email,
        imageUrl: clerkUser.imageUrl,
        role: "employee",
        status: "active",
      })
      .returning();

    return createdUser;
  } catch (error) {
    logServerError("auth.syncCurrentUser.database", error);
    throw new Error(databaseSetupMessage);
  }
}
