"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateUserStatus } from "@/lib/actions/users";

const statuses = ["active", "suspended", "disabled"] as const;

type Status = (typeof statuses)[number];
type LegacyStatus = Status | "inactive";

type UserStatusSelectProps = {
  userId: string;
  value: LegacyStatus;
  isCurrentUser: boolean;
};

export function UserStatusSelect({
  userId,
  value,
  isCurrentUser,
}: UserStatusSelectProps) {
  const router = useRouter();
  const currentStatus = value === "inactive" ? "disabled" : value;
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isCurrentUser && status !== "active") {
      const confirmed = window.confirm(
        "You are changing your own account status. Continue?",
      );

      if (!confirmed) {
        setStatus(currentStatus);
        return;
      }
    }

    try {
      setLoading(true);
      await updateUserStatus(userId, status);
      toast.success("Account status updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setStatus(currentStatus);
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
            {formatStatus(item)}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={loading || status === currentStatus}
        onClick={handleSave}
        className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Account Status"}
      </button>
    </div>
  );
}

function formatStatus(status: Status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
