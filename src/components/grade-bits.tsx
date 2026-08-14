import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { Klass, Settings } from "@/lib/types";
import { classGrade, statusFor } from "@/lib/grading";
import { cn } from "@/lib/utils";

export function GradeValue({ value, max, className }: { value: number | null; max: number; className?: string }) {
  return (
    <span className={cn("font-display tabular-nums", className)}>
      {value === null ? "—" : value.toFixed(2)}
      <span className="text-muted-foreground text-[0.6em] font-normal"> / {max}</span>
    </span>
  );
}

export function StatusBadge({ klass, settings }: { klass: Klass; settings: Settings }) {
  const { t } = useTranslation();
  const { grade } = classGrade(klass);
  const status = statusFor(grade, klass, settings);
  if (!status) return <span className="text-xs text-muted-foreground">{t("klass.noStatus")}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${status.color}1a`, color: status.color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: status.color }} />
      {status.label}
    </span>
  );
}

export function ClassCard({ klass, settings }: { klass: Klass; settings: Settings }) {
  const { grade } = classGrade(klass);
  const pct = grade === null ? 0 : Math.max(0, Math.min(100, (grade / klass.maxGrade) * 100));

  return (
    <Link
      to="/class/$classId"
      params={{ classId: klass.id }}
      className="card-soft group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${klass.color}1f` }}
          >
            {klass.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{klass.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[klass.code, `${klass.credits} cr`].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <GradeValue value={grade} max={klass.maxGrade} className="text-xl font-semibold" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: klass.color }} />
      </div>
      <StatusBadge klass={klass} settings={settings} />
    </Link>
  );
}
