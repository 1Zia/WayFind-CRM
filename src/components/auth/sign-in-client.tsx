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
    <div className="rounded-xl border bg-white px-6 py-5 text-sm text-zinc-500 shadow-sm">
      {label}
    </div>
  );
}

export function SignInClient() {
  return <SignIn />;
}
