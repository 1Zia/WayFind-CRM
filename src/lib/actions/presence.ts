"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logServerError } from "@/lib/errors";

export async function updateCurrentUserPresence() {
  const user = await requireUser();

  try {
    await db
      .update(users)
      .set({
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    logServerError("presence.updateCurrentUserPresence", error);
    return { success: false };
  }
}
