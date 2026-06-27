"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateTaskEstimate } from "@/lib/actions/tasks";

export function TaskInlineEstimateInput({
  disabled,
  estimatePoints,
  taskId,
}: {
  disabled?: boolean;
  estimatePoints: number;
  taskId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(estimatePoints);
  const [loading, setLoading] = useState(false);

  async function handleBlur() {
    if (value === estimatePoints) {
      return;
    }

    try {
      setLoading(true);
      await updateTaskEstimate(taskId, value);
      toast.success("Estimate updated");
      router.refresh();
    } catch (error) {
      setValue(estimatePoints);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <input
      disabled={disabled || loading}
      min={0}
      max={100}
      type="number"
      value={value}
      onChange={(event) => setValue(Number(event.target.value))}
      onBlur={handleBlur}
      className="w-20 rounded-md border px-2 py-1.5 text-xs disabled:opacity-60"
    />
  );
}
