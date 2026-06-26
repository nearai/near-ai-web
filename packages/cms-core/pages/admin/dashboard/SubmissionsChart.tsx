"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@cms/components/ui/card";

type WeekData = { week: string; count: number };

const RANGES = [
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "ytd", label: "YTD" },
] as const;
type Range = (typeof RANGES)[number]["key"];

function weekLabel(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function showXLabel(i: number, total: number) {
  if (total <= 6)  return true;
  if (total <= 13) return i % 2 === 0;
  if (total <= 26) return i % 4 === 0;
  return i % 8 === 0;
}

export function SubmissionsChart({ data }: { data: WeekData[] }) {
  const [range, setRange] = useState<Range>("90d");

  const filtered = useMemo(() => {
    const cutoff = new Date();
    if (range === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (range === "90d") cutoff.setDate(cutoff.getDate() - 90);
    else cutoff.setMonth(0, 1);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return data.filter((d) => d.week >= cutoffStr);
  }, [data, range]);

  const max   = Math.max(...filtered.map((d) => d.count), 1);
  const total = filtered.reduce((s, d) => s + d.count, 0);
  const mid   = Math.round(max / 2);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Form Submissions</CardTitle>
            <CardDescription>{total} submission{total !== 1 ? "s" : ""} in selected period</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1 shrink-0">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  range === r.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No submissions in this period
          </div>
        ) : (
          <div className="flex flex-col gap-1">

            {/* Y-axis + bars */}
            <div className="flex gap-2 h-32">

              {/* Y-axis labels */}
              <div className="flex flex-col justify-between items-end w-5 shrink-0 text-[10px] text-muted-foreground select-none pb-px">
                <span>{max}</span>
                {mid > 0 && mid < max && <span>{mid}</span>}
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="relative flex-1">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-border/25 w-full" />
                  <div className="border-t border-border/25 w-full" />
                  <div className="border-t border-border/40 w-full" />
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-[3px]">
                  {filtered.map((d) => {
                    const h = Math.max((d.count / max) * 100, d.count > 0 ? 6 : 1);
                    return (
                      <div
                        key={d.week}
                        className="group/bar relative flex-1 min-w-[4px] max-w-[36px] h-full flex flex-col justify-end"
                      >
                        <div
                          className="w-full rounded-t-sm bg-blue-400/70 hover:bg-blue-400 transition-colors cursor-default"
                          style={{ height: `${h}%` }}
                        />
                        {d.count > 0 && (
                          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/bar:block z-10 whitespace-nowrap bg-popover border border-border text-popover-foreground text-xs rounded px-2 py-1 shadow-md pointer-events-none">
                            <span className="font-semibold">{d.count}</span> submission{d.count !== 1 ? "s" : ""}
                            <span className="block text-muted-foreground">{weekLabel(d.week)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex gap-[3px] pl-7">
              {filtered.map((d, i) => (
                <div key={d.week} className="flex-1 min-w-[4px] max-w-[36px] overflow-hidden">
                  {showXLabel(i, filtered.length) && (
                    <p className="text-[9px] text-muted-foreground truncate leading-tight">
                      {weekLabel(d.week)}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
