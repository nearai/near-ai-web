"use client";

import { useState } from "react";

type UseCase = {
  title: string;
  description: string;
  category: string;
  tags: string[];
};

type Props = {
  items: UseCase[];
};

const CATEGORIES = ["All", "Communication", "Productivity", "Monitoring", "Developer", "Automation"];

export default function UseCaseFilter({ items }: Props) {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? items : items.filter((item) => item.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.75rem] uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
              active === category
                ? "bg-[#101010] text-[#ECECEC]"
                : "border border-[#101010]/25 text-[#101010] hover:bg-[#101010]/05"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div data-reveal-group className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <div
            key={item.title}
            data-reveal-item
            className="flex flex-col gap-3 rounded-[2rem] border border-[#CAC8C8] p-6"
          >
            <h4 className="font-medium leading-[1.15] text-[#101010] [font-size:var(--font-size-h3)]">
              {item.title}
            </h4>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)]">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#CAC8C8] px-2.5 py-0.5 font-mono text-[0.7rem] leading-none text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
