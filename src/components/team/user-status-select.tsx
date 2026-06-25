"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateUserStatus } from "@/lib/actions/users";

const statuses = ["active", "inactive", "suspended"] as const;

type Status = (typeof statuses)[number];

type UserStatusSelectProps = {
  userId: string;
  value: Status;
  isCurrentUser: boolean;
};

export function UserStatusSelect({
  userId,
  value,
  isCurrentUser,
}: UserStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(value);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isCurrentUser && status !== "active") {
      const confirmed = window.confirm(
        "You are changing your own account status. Continue?",
      );

      if (!confirmed) {
        setStatus(value);
        return;
      }
    }

    try {
      setLoading(true);
      await updateUserStatus(userId, status);
      toast.success("User status updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setStatus(value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as Status)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={loading || status === value}
        onClick={handleSave}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Status"}
      </button>
    </div>
  );
}
