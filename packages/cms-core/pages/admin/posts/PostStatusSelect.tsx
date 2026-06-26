"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const STYLES: Record<Status, string> = {
  PUBLISHED: "text-primary bg-primary/10",
  DRAFT:     "text-muted-foreground bg-muted/50",
  ARCHIVED:  "text-muted-foreground/60 bg-muted/30",
};

const DOT: Record<Status, string> = {
  PUBLISHED: "bg-primary",
  DRAFT:     "bg-muted-foreground/50",
  ARCHIVED:  "bg-muted-foreground/30",
};

export function PostStatusSelect({ id, initial }: { id: string; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Status;
    setSaving(true);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setStatus(next);
      toast.success(`Status → ${next.charAt(0) + next.slice(1).toLowerCase()}`);
      router.refresh();
    } else if (res.status === 423) {
      toast.error("Post is currently being edited by someone else");
    } else {
      toast.error("Failed to update status");
    }
    setSaving(false);
  }

  return (
    <div className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]} ${saving ? "opacity-60" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[status]}`} />
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="bg-transparent border-none outline-none cursor-pointer appearance-none pr-3 text-inherit font-inherit"
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <svg className="w-2.5 h-2.5 absolute right-1.5 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
