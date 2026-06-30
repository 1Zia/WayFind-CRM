"use client";

import dynamic from "next/dynamic";

const SignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignIn),
  {
    ssr: false,
    loading: () => <AuthLoading label="Loading sign in..." />,
  },
);

function AuthLoading({ label }: { label: string }) {
  return (
    <div className="crm-card px-6 py-5 text-sm text-crm-muted shadow-card">
      {label}
    </div>
  );
}

export function SignInClient() {
  return (
    <div className="crm-card w-full max-w-md overflow-hidden p-6 shadow-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-crm-primary text-lg font-bold text-white">
          W
        </div>
        <h1 className="text-xl font-semibold text-crm-heading">WayFind CRM</h1>
        <p className="mt-1 text-sm text-crm-muted">Sign in to your workspace</p>
      </div>
      <SignIn />
    </div>
  );
}
