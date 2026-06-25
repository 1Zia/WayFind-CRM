"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateUserRole } from "@/lib/actions/users";

const roles = [
  "super_admin",
  "finance_manager",
  "project_manager",
  "employee",
] as const;

type Role = (typeof roles)[number];

type UserRoleSelectProps = {
  userId: string;
  value: Role;
  isCurrentUser: boolean;
};

export function UserRoleSelect({
  userId,
  value,
  isCurrentUser,
}: UserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(value);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isCurrentUser && role !== "super_admin") {
      const confirmed = window.confirm(
        "You are changing your own super admin role. Continue?",
      );

      if (!confirmed) {
        setRole(value);
        return;
      }
    }

    try {
      setLoading(true);
      await updateUserRole(userId, role);
      toast.success("User role updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setRole(value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        {roles.map((item) => (
          <option key={item} value={item}>
            {item.replace("_", " ")}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={loading || role === value}
        onClick={handleSave}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Role"}
      </button>
    </div>
  );
}
