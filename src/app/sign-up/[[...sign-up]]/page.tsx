import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      {hasClerkKey ? <SignUp /> : <p>Clerk publishable key is not configured.</p>}
    </div>
  );
}
