type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function MacWindow({ title, children, className = "" }: Props) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1e1e1e] border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center font-mono text-[0.6875rem] text-white/40 tracking-wide">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
