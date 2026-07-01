"use client";

import dynamic from "next/dynamic";

const SignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  {
    ssr: false,
    loading: () => <AuthLoading label="Loading sign up..." />,
  },
);

function AuthLoading({ label }: { label: string }) {
  return (
    <div className="crm-card px-6 py-5 text-sm text-crm-muted">
      {label}
    </div>
  );
}

export function SignUpClient() {
  return (
    <div className="crm-card w-full max-w-md overflow-hidden p-6 md:p-8">
      <div className="mb-6 text-center">
        <div className="liquid-glass-active mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-slate-900">
          <span className="relative z-10">W</span>
        </div>
        <h1 className="text-xl font-semibold text-crm-heading">WayFind CRM</h1>
        <p className="mt-1 text-sm text-crm-muted">Create your workspace account</p>
      </div>
      <SignUp />
    </div>
  );
}
