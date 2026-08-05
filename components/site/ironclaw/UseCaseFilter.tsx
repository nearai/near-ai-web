"use client";

import { useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel";
import {
  Inbox, Sunrise, CalendarClock, MessagesSquare, Radar, Activity, GitBranch,
  ListChecks, Receipt, BarChart3, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Inbox, Sunrise, CalendarClock, MessagesSquare, Radar, Activity, GitBranch,
  ListChecks, Receipt, BarChart3,
};

type UseCase = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  icon: keyof typeof ICONS;
};

type Props = {
  items: UseCase[];
};

const CATEGORIES = ["All", "Communication", "Productivity", "Monitoring", "Developer", "Automation"];

function UseCaseCard({ item, className = "" }: { item: UseCase; className?: string }) {
  const Icon = ICONS[item.icon];
  return (
    <div
      data-reveal-item
      className={`flex flex-col gap-3 rounded-[2rem] border border-[#CAC8C8] p-6 h-full ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-[22px] h-[22px] text-[#0072C9] shrink-0" />
        <h4 className="font-medium leading-[1.15] text-[#101010] [font-size:var(--font-size-body)]">
          {item.title}
        </h4>
      </div>
      <p className="text-pretty font-mono text-muted leading-relaxed [font-size:0.875rem]">
        {item.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#CAC8C8] px-2.5 py-0.5 text-[0.75rem] leading-none text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function UseCaseSlider({ items }: { items: UseCase[] }) {
  const emblaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaRef.current || items.length === 0) return;
    const api = EmblaCarousel(emblaRef.current, { align: "start", containScroll: "trimSnaps" });
    return () => api.destroy();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div ref={emblaRef} className="overflow-hidden -mx-5 px-5">
      <div className="flex gap-4">
        {items.map((item) => (
          <div key={item.title} className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_60%]">
            <UseCaseCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UseCaseFilter({ items }: Props) {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? items : items.filter((item) => item.category === active);

  const half = Math.ceil(filtered.length / 2);
  const rowA = filtered.slice(0, half);
  const rowB = filtered.slice(half);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-1.5 text-[0.75rem] uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
              active === category
                ? "bg-[#101010] text-[#ECECEC]"
                : "border border-[#101010]/25 text-[#101010] hover:bg-[#101010]/05"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile — 2 draggable sliders, one user can swipe through per row */}
      <div className="flex flex-col gap-4 md:hidden">
        <UseCaseSlider items={rowA} />
        <UseCaseSlider items={rowB} />
      </div>

      {/* Desktop — unchanged full grid */}
      <div data-reveal-group className="hidden md:grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <UseCaseCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}
