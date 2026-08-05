"use client";

import { useState } from "react";
import {
  Mail, HardDrive, FileSpreadsheet, Github, MessagesSquare, Search,
  Calendar, FileText, Presentation, Send, MessageCircle, Boxes,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@near/cms-core/components/ui/dialog";

const ICONS: Record<string, LucideIcon> = {
  Mail, HardDrive, FileSpreadsheet, Github, MessagesSquare, Search,
  Calendar, FileText, Presentation, Send, MessageCircle, Boxes,
};

export type Integration = {
  name: string;
  icon: keyof typeof ICONS;
  recipes: { title: string; description: string }[];
};

type RowProps = {
  items: Integration[];
  reverse?: boolean;
  forcePaused: boolean;
  onSelect: (integration: Integration) => void;
};

function Row({ items, reverse = false, forcePaused, onSelect }: RowProps) {
  const [hovered, setHovered] = useState(false);
  const tripled = [...items, ...items, ...items];
  const paused = hovered || forcePaused;

  return (
    <div
      className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex w-max gap-4 motion-reduce:animate-none"
        style={{
          animationName: "ironclaw-integration-marquee",
          animationDuration: "60s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {tripled.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <button
              key={`${item.name}-${i}`}
              type="button"
              onClick={() => onSelect(item)}
              className="shrink-0 flex items-center gap-3 rounded-xl border border-[#CAC8C8] bg-[#ECECEC] px-5 py-3.5 cursor-pointer transition-colors hover:border-[#101010]/40"
            >
              <Icon className="w-[22px] h-[22px] text-[#0072C9] shrink-0" />
              <span className="flex flex-col items-start">
                <span className="font-medium text-[15px] leading-tight whitespace-nowrap text-[#101010]">{item.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted whitespace-nowrap">
                  {item.recipes.length} recipes
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  rowA: Integration[];
  rowB: Integration[];
};

export default function IntegrationMarquee({ rowA, rowB }: Props) {
  const [selected, setSelected] = useState<Integration | null>(null);
  const dialogOpen = !!selected;

  return (
    <>
      {/* Keyframe defined inline (not in globals.css) so build-time CSS
          tree-shaking can't drop an animation-name it can't statically see. */}
      <style>{`
        @keyframes ironclaw-integration-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>

      <div className="flex flex-col gap-4">
        <Row items={rowA} forcePaused={dialogOpen} onSelect={setSelected} />
        <Row items={rowB} reverse forcePaused={dialogOpen} onSelect={setSelected} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md bg-[#ECECEC] border-[#CAC8C8] rounded-[2rem] text-[#101010] p-9">
          {selected && (
            <>
              <DialogTitle className="font-medium [font-size:var(--font-size-h3)] tracking-[-0.02em]">
                {selected.name}
              </DialogTitle>
              <DialogDescription className="font-mono text-muted [font-size:var(--font-size-body)]">
                {selected.recipes.length} automations you can hand off right now.
              </DialogDescription>
              <ul className="flex flex-col gap-4 mt-2 mb-2">
                {selected.recipes.map((recipe) => (
                  <li key={recipe.title} className="flex flex-col gap-1 pb-4 border-b border-[#CAC8C8] last:border-0 last:pb-0">
                    <span className="font-medium text-[#101010] [font-size:var(--font-size-body)]">{recipe.title}</span>
                    <span className="font-mono text-muted leading-relaxed [font-size:var(--font-size-body)]">{recipe.description}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
