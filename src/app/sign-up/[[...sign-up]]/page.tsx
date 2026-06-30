import { SignUpClient } from "@/components/auth/sign-up-client";

export default function SignUpPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-body px-4 py-10">
      {hasClerkKey ? (
        <SignUpClient />
      ) : (
        <p className="text-sm text-crm-muted">
          Clerk publishable key is not configured.
        </p>
      )}
    </div>
  );
}
