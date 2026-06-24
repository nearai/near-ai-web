"use client";

import { useState } from "react";
import { toast } from "sonner";

const STATUSES = ["NEW", "CONTACTED", "ARCHIVED"] as const;
type Status = (typeof STATUSES)[number];

const statusStyles: Record<Status, string> = {
  NEW:       "bg-blue-500/10 text-blue-500 border-blue-400/30",
  CONTACTED: "bg-green-500/10 text-green-600 border-green-400/30",
  ARCHIVED:  "bg-muted/50 text-muted-foreground border-border",
};

export function StatusSelect({ id, initial }: { id: string; initial: string }) {
  const [status, setStatus] = useState<Status>(
    (STATUSES as readonly string[]).includes(initial) ? (initial as Status) : "NEW"
  );
  const [saving, setSaving] = useState(false);

  async function handleChange(next: Status) {
    setSaving(true);
    try {
      const res = await fetch(`/api/form-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setStatus(next);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as Status)}
      className={`text-xs font-medium border rounded-full px-2.5 py-1 outline-none cursor-pointer transition-colors disabled:opacity-50 ${statusStyles[status]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
