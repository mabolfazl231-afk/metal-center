import { Inbox, AlertOctagon } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  title = "چیزی پیدا نشد",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-steel dark:bg-white/5">
        <Inbox size={26} className="text-ink/30" />
      </div>
      <p className="font-bold">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink/50">{description}</p>}
      {action && (
        <Button variant="ghost" size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "مشکلی پیش آمد",
  description = "لطفاً دوباره تلاش کنید.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertOctagon size={26} className="text-danger" />
      </div>
      <p className="font-bold">{title}</p>
      <p className="max-w-xs text-sm text-ink/50">{description}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}
