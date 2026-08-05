type Props = {
  items: string[];
  reverse?: boolean;
};

export default function Marquee({ items, reverse = false }: Props) {
  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={`flex w-max gap-4 motion-reduce:animate-none ${
          reverse ? "animate-[marquee_40s_linear_infinite_reverse]" : "animate-[marquee_40s_linear_infinite]"
        }`}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="shrink-0 rounded-full border border-[#CAC8C8] bg-[#ECECEC] px-6 py-3 font-mono text-[0.75rem] uppercase tracking-widest text-muted whitespace-nowrap"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
