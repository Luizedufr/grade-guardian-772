import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ClassCard } from "@/components/grade-bits";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { classGrade, statusFor } from "@/lib/grading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Marklet Grade Tracker" },
      { name: "description", content: "Your live average, passed credits and active classes at a glance." },
      { property: "og:title", content: "Dashboard — Marklet Grade Tracker" },
      { property: "og:description", content: "Your live average, passed credits and active classes at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { classes, units, settings, updateSettings, addUnit, addClass } = useAppStore();

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  const graded = classes
    .map((k) => ({ k, g: classGrade(k).grade }))
    .filter((x): x is { k: (typeof classes)[number]; g: number } => x.g !== null);

  const considered = settings.includeFailedInAverage
    ? graded
    : graded.filter(({ k, g }) => statusFor(g, k, settings)?.passing);

  const creditSum = considered.reduce((a, { k }) => a + (k.credits || 0), 0);
  const average =
    creditSum > 0 ? considered.reduce((a, { k, g }) => a + g * (k.credits || 0), 0) / creditSum : null;

  const passedCredits = graded
    .filter(({ k, g }) => statusFor(g, k, settings)?.passing)
    .reduce((a, { k }) => a + (k.credits || 0), 0);

  const activeClasses = classes.filter((c) => c.active);

  const createClass = () => {
    const unitId = units[0]?.id ?? addUnit("Semester 1").id;
    const k = addClass(unitId);
    toast.success(t("toast.created"));
    void navigate({ to: "/class/$classId", params: { classId: k.id } });
  };

  return (
    <div className="space-y-8">
      <section className="card-soft grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("dashboard.average")}</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums">
            {average === null ? "—" : average.toFixed(2)}
          </p>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={settings.includeFailedInAverage}
              onCheckedChange={(v) => updateSettings({ includeFailedInAverage: v })}
            />
            {t("dashboard.includeFailed")}
          </label>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("dashboard.passedCredits")}</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{passedCredits}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("dashboard.activeClasses")}</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{activeClasses.length}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold">{t("dashboard.activeClasses")}</h1>
          <Button size="sm" onClick={createClass}>
            <Plus className="size-4" /> {t("dashboard.newClass")}
          </Button>
        </div>
        {activeClasses.length === 0 ? (
          <p className="card-soft p-10 text-center text-sm text-muted-foreground">{t("dashboard.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeClasses.map((k) => (
              <ClassCard key={k.id} klass={k} settings={settings} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
