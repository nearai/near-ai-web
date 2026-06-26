"use client";

import React, { useState } from "react";
import { StatusSelect } from "./StatusSelect";

type FDEData = {
  contactName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  productCategory?: string;
  solutionDescription?: string;
  timeZone?: string;
};

type Props = {
  sub: {
    id: string;
    status: string;
    data?: Record<string, unknown>;
  };
  formattedDate: string;
};

export function SubmissionRow({ sub, formattedDate }: Props) {
  const [open, setOpen] = useState(false);
  const d = (sub.data ?? {}) as FDEData;

  return (
    <React.Fragment>
      <tr className="hover:bg-muted/20 transition border-t border-border/50 first:border-t-0">
        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </td>
        <td className="px-6 py-4 text-sm font-medium">{d.contactName ?? "—"}</td>
        <td className="px-6 py-4 text-sm">{d.companyName ?? "—"}</td>
        <td className="px-6 py-4 text-sm">
          {d.email ? (
            <a href={`mailto:${d.email}`} className="hover:text-primary transition">
              {d.email}
            </a>
          ) : "—"}
        </td>
        <td className="px-6 py-4">
          <StatusSelect id={sub.id} initial={sub.status} />
        </td>
        <td className="px-6 py-4">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            <svg
              className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {open ? "Hide" : "Details"}
          </button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="px-6 pt-4 pb-5 bg-muted/5 border-t border-border/40 flex items-start justify-end gap-12">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Category</p>
                <p className="text-sm">{d.productCategory ?? "—"}</p>
              </div>
              {d.phone && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm">{d.phone}</p>
                </div>
              )}
              {d.timeZone && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Time Zone</p>
                  <p className="text-sm">{d.timeZone}</p>
                </div>
              )}
              {d.solutionDescription && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Solution Description</p>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{d.solutionDescription}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
