"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { SidebarTooltip } from "@cms/components/admin/SidebarTooltip";

function fmt(date: Date, tz: string) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz,
  });
}

function utcOffset(date: Date) {
  const off = -date.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const h = Math.floor(Math.abs(off) / 60);
  const m = Math.abs(off) % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

export function SidebarClock({ collapsed }: { collapsed: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Avoid hydration mismatch — render nothing on server
  if (!now) return null;

  const tz       = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local    = fmt(now, tz);
  const utc      = fmt(now, "UTC");
  const offset   = utcOffset(now);

  if (collapsed) {
    return (
      <SidebarTooltip label={<span className="tabular-nums">{local} <span className="opacity-60">{offset}</span><br />{utc} UTC</span>} collapsed>
        <div className="w-full p-2 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
      </SidebarTooltip>
    );
  }

  return (
    <div className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm text-muted-foreground">
      <Clock className="w-4 h-4 opacity-70 shrink-0" />
      <div className="flex flex-col leading-snug">
        <span className="text-xs tabular-nums">
          {local}{" "}
          <span className="text-[10px] opacity-60">{offset}</span>
        </span>
        <span className="text-[10px] opacity-60 tabular-nums">{utc} UTC</span>
      </div>
    </div>
  );
}
