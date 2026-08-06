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
      className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f1f1f1] p-6 flex flex-col gap-3 h-full transition-all"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(76,167,230,0.25) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to bottom left, black 0%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(to bottom left, black 0%, transparent 65%)",
        }}
      />
      <div className="flex items-start gap-3 relative z-10">
        <Icon className="w-5 h-5 text-[#4CA7E6] shrink-0" />
        <h3 className="font-medium leading-[1.15] text-[#101010] [font-size:var(--font-size-body)]">{item.title}</h3>
      </div>
      <p className="text-pretty font-mono text-muted leading-relaxed [font-size:0.875rem] relative z-10">{item.text}</p>
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
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </div>
    </>
  );
}
