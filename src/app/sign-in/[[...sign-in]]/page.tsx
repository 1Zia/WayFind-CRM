import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      {hasClerkKey ? <SignIn /> : <p>Clerk publishable key is not configured.</p>}
    </div>
  );
}
