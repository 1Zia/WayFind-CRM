import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (user) {
    return user;
  }

  return syncCurrentUser();
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
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
}
