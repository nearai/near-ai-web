"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@cms/components/ui/card";

type Props = { data: Record<string, number> };

const CELL = 12;          // w-3 = 12px
const GAP = 4;            // gap-1 = 4px
const COL_W = CELL + GAP; // 16px per week column
const LEFT_W = 28;        // day labels: w-6 (24px) + gap-1 (4px)

function cellColor(count: number) {
  if (count === 0) return "bg-muted/40";
  if (count === 1) return "bg-primary/25";
  if (count <= 3) return "bg-primary/50";
  if (count <= 6) return "bg-primary/75";
  return "bg-primary";
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function ActivityHeatmap({ data }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState(26);

  useEffect(() => {
    const recalc = () => {
      if (!wrapRef.current) return;
      const w = Math.max(4, Math.floor((wrapRef.current.clientWidth - LEFT_W) / COL_W));
      setWeeks(w);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Build grid: exactly `weeks` columns × 7 rows, ending with the current week
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Monday of the current week
  const todayDow = today.getUTCDay(); // 0=Sun … 6=Sat
  const toMon = todayDow === 0 ? -6 : 1 - todayDow;
  const thisMonday = new Date(today);
  thisMonday.setUTCDate(today.getUTCDate() + toMon);

  // Grid starts (weeks-1) full weeks before this Monday → always exactly `weeks` cols
  const gridStart = new Date(thisMonday);
  gridStart.setUTCDate(thisMonday.getUTCDate() - (weeks - 1) * 7);

  const grid: Date[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(gridStart);
      day.setUTCDate(gridStart.getUTCDate() + w * 7 + d);
      week.push(day);
    }
    grid.push(week);
  }

  // Month label: first week of each new month
  const monthLabels = new Map<number, string>();
  grid.forEach((week, i) => {
    const prev = grid[i - 1];
    if (!prev || prev[0].getUTCMonth() !== week[0].getUTCMonth()) {
      monthLabels.set(i, week[0].toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }));
    }
  });

  const total = Object.values(data).reduce((s, n) => s + n, 0);
  const spanMonths = Math.round((weeks * 7) / 30);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">CMS Activity</CardTitle>
        <CardDescription>
          {total > 0
            ? `${total} actions · last ~${spanMonths} month${spanMonths !== 1 ? "s" : ""}`
            : `No activity recorded yet · showing last ~${spanMonths} month${spanMonths !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={wrapRef} className="flex flex-col gap-1 overflow-hidden">

          {/* Month labels row */}
          <div className="flex gap-1 pl-7">
            {grid.map((_, i) => (
              <div key={i} className="w-3 text-[9px] text-muted-foreground leading-none shrink-0">
                {monthLabels.get(i) ?? ""}
              </div>
            ))}
          </div>

          {/* Day rows: Mon(0)…Sun(6) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
            <div key={dow} className="flex items-center gap-1">
              <span className="w-6 text-[9px] text-muted-foreground text-right shrink-0 select-none">
                {dow === 0 ? "Mo" : dow === 2 ? "We" : dow === 4 ? "Fr" : ""}
              </span>
              {grid.map((week, wi) => {
                const day = week[dow];
                if (!day) return <div key={wi} className="w-3 h-3 shrink-0" />;
                const isFuture = day > today;
                const dateStr = day.toISOString().split("T")[0];
                const count = data[dateStr] ?? 0;
                return (
                  <div
                    key={wi}
                    title={isFuture ? "" : `${dayLabel(day)} · ${count} action${count !== 1 ? "s" : ""}`}
                    className={`w-3 h-3 rounded-sm shrink-0 transition-colors ${
                      isFuture ? "opacity-0 pointer-events-none" : cellColor(count)
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {["bg-muted/40", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"].map((cls) => (
            <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
