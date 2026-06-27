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
    <div className="rounded-xl border bg-white px-6 py-5 text-sm text-zinc-500 shadow-sm">
      {label}
    </div>
  );
}

export function SignUpClient() {
  return <SignUp />;
}
