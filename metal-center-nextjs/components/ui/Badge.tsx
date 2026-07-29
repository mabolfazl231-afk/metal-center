type Tone = "blue" | "success" | "warning" | "danger" | "neutral";

const toneMap: Record<Tone, string> = {
  blue: "bg-blue/10 text-blue",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-[#B87700]",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-steel text-ink/60 dark:bg-white/10 dark:text-white/60",
};

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-bold ${toneMap[tone]}`}>
      {children}
    </span>
  );
}
