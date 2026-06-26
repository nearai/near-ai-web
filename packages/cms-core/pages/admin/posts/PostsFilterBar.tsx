"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@cms/components/ui/input";
import Link from "next/link";

type Counts = { all: number; published: number; draft: number; archived: number };

const PILLS = [
  { label: "All",       value: "",          countKey: "all"       },
  { label: "Published", value: "PUBLISHED",  countKey: "published" },
  { label: "Draft",     value: "DRAFT",      countKey: "draft"     },
  { label: "Archived",  value: "ARCHIVED",   countKey: "archived"  },
] as const;

export function PostsFilterBar({
  q,
  status,
  counts,
}: {
  q: string;
  status: string;
  counts: Counts;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(q);

  // Sync external q changes (e.g. after pill navigation)
  useEffect(() => { setSearch(q); }, [q]);

  // Debounced search → push URL
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (status) params.set("status", status);
      router.push(`/admin/posts${params.size ? "?" + params : ""}`);
    }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function pillHref(val: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (val) params.set("status", val);
    return `/admin/posts${params.size ? "?" + params : ""}`;
  }

  return (
    <div className="flex flex-col gap-3" data-posts-tour-id="filter-bar">

      {/* Quick-filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {PILLS.map((pill) => {
          const active = status === pill.value;
          const count = counts[pill.countKey as keyof Counts];
          return (
            <Link
              key={pill.value}
              href={pillHref(pill.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {pill.label}
              <span className={`text-xs tabular-nums ${active ? "opacity-70" : "opacity-60"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Debounced search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="pl-8"
        />
      </div>
    </div>
  );
}
