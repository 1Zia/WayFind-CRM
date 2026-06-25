import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;

  if (!email) {
    console.error("Missing email. Usage: npm run admin:make-super -- user@example.com");
    process.exit(1);
  }

  const [{ db }, { users }] = await Promise.all([
    import("../src/db"),
    import("../src/db/schema"),
  ]);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    console.error(
      "User not found. Sign in once with Clerk first, then run this script again.",
    );
    process.exit(1);
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      role: "super_admin",
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(users.id, existingUser.id))
    .returning();

  console.log(
    `Success: ${updatedUser.email} is now an active super_admin user.`,
  );
}

main().catch((error) => {
  console.error("Failed to promote super admin.");
  console.error(error);
  process.exit(1);
});
