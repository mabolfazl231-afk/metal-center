import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

type Tone = "info" | "success" | "warning" | "danger";

const config: Record<Tone, { icon: any; classes: string }> = {
  info: { icon: Info, classes: "bg-blue/8 border-blue/20 text-blue" },
  success: { icon: CheckCircle2, classes: "bg-success/8 border-success/20 text-success" },
  warning: { icon: AlertTriangle, classes: "bg-warning/10 border-warning/25 text-[#B87700]" },
  danger: { icon: XCircle, classes: "bg-danger/8 border-danger/20 text-danger" },
};

export default function Alert({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  const { icon: Icon, classes } = config[tone];
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium animate-fade-in ${classes}`}>
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
