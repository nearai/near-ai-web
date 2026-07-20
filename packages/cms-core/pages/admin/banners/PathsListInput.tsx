"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@cms/components/ui/input";

export function PathsListInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (paths: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addPath() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("/")) {
      setDraft("");
      return;
    }
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  }

  function removePath(path: string) {
    onChange(value.filter((p) => p !== path));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((path) => (
            <span
              key={path}
              className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-mono"
            >
              {path}
              <button type="button" onClick={() => removePath(path)} className="hover:text-destructive">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addPath();
          }
        }}
        placeholder="/blog/* — Enter to add"
        className="bg-muted/30 border-border/70 font-mono text-xs"
      />
      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? "Empty = shown on all pages."
          : "Exact paths, or a prefix ending in /* (e.g. /blog/*)."}
      </p>
    </div>
  );
}
