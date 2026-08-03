"use client";

import { useEffect, useRef } from "react";
import EmblaCarousel from "embla-carousel";
import { Lock, Database, ShieldCheck, Eye, Code2, Network, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { Lock, Database, ShieldCheck, Eye, Code2, Network };

type Feature = {
  title: string;
  text: string;
  icon: keyof typeof ICONS;
};

type Props = {
  items: Feature[];
};

function FeatureCard({ item }: { item: Feature }) {
  const Icon = ICONS[item.icon];
  return (
    <div
      data-reveal-item
      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-4 h-full"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-[25px] h-[25px] text-[#4CA7E6] shrink-0" />
        <h3 className="font-medium leading-[1.15] text-white [font-size:var(--font-size-h3)]">{item.title}</h3>
      </div>
      <p className="text-pretty font-mono text-white/55 leading-[1.6] [font-size:var(--font-size-body)]">{item.text}</p>
    </div>
  );
}

export default function SecurityFeaturesGrid({ items }: Props) {
  const emblaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaRef.current || items.length === 0) return;
    const api = EmblaCarousel(emblaRef.current, { align: "start", containScroll: "trimSnaps" });
    return () => api.destroy();
  }, [items]);

  return (
    <>
      {/* Mobile — draggable slider */}
      <div ref={emblaRef} className="overflow-hidden -mx-8 px-8 md:hidden">
        <div className="flex gap-4">
          {items.map((item) => (
            <div key={item.title} className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_60%]">
              <FeatureCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop — unchanged grid */}
      <div data-reveal-group className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </div>
    </>
  );
}
