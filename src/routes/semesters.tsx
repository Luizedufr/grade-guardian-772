import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradeValue, StatusBadge } from "@/components/grade-bits";
import { useHydrated } from "@/hooks/use-hydrated";
import { classGrade } from "@/lib/grading";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/semesters")({
  head: () => ({
    meta: [
      { title: "Semesters — Marklet Grade Tracker" },
      { name: "description", content: "Browse every grading unit and the classes nested inside it." },
      { property: "og:title", content: "Semesters — Marklet Grade Tracker" },
      { property: "og:description", content: "Browse every grading unit and the classes nested inside it." },
    ],
  }),
  component: Semesters,
});

function Semesters() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { units, classes, settings, addUnit, renameUnit, removeUnit, addClass } = useAppStore();
  const [name, setName] = useState("");

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  const create = () => {
    addUnit(name.trim() || `Semester ${units.length + 1}`);
    setName("");
    toast.success(t("toast.created"));
  };

  const sorted = [...units].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t("units.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("units.subtitle")}</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={name}
          placeholder={t("units.name")}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button onClick={create}>
          <Plus className="size-4" /> {t("units.new")}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="card-soft p-10 text-center text-sm text-muted-foreground">{t("units.empty")}</p>
      ) : (
        <div className="space-y-6">
          {sorted.map((unit) => {
            const list = classes.filter((c) => c.unitId === unit.id);
            return (
              <section key={unit.id} className="card-soft overflow-hidden">
                <header className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
                  <Input
                    value={unit.name}
                    onChange={(e) => renameUnit(unit.id, e.target.value)}
                    className="h-9 max-w-xs border-transparent bg-transparent px-2 font-display text-base font-semibold shadow-none focus-visible:border-input"
                  />
                  <span className="ml-auto text-xs text-muted-foreground">{t("units.classCount", { count: list.length })}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeUnit(unit.id);
                      toast.success(t("toast.deleted"));
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </header>
                <ul className="divide-y divide-border/70">
                  {list.map((k) => (
                    <li key={k.id}>
                      <Link
                        to="/class/$classId"
                        params={{ classId: k.id }}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                      >
                        <span className="text-lg">{k.emoji}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{k.name}</span>
                        <StatusBadge klass={k} settings={settings} />
                        <GradeValue value={classGrade(k).grade} max={k.maxGrade} className="text-sm" />
                      </Link>
                    </li>
                  ))}
                  {list.length === 0 && (
                    <li className="px-4 py-6 text-center text-xs text-muted-foreground">{t("units.noClasses")}</li>
                  )}
                </ul>
                <div className="border-t border-border/70 px-4 py-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const k = addClass(unit.id);
                      toast.success(t("toast.created"));
                      void navigate({ to: "/class/$classId", params: { classId: k.id } });
                    }}
                  >
                    <Plus className="size-4" /> {t("dashboard.newClass")}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
