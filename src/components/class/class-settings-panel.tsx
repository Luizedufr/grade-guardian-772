import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { checkCondition, slug, totalWeight } from "@/lib/grading";
import type { Klass } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export function ClassSettingsPanel({ klass }: { klass: Klass }) {
  const { t } = useTranslation();
  const { updateClass, addScheme, updateScheme, removeScheme } = useAppStore();
  const check = checkCondition(klass.resit.condition, klass);

  return (
    <div className="space-y-4">
      <section className="card-soft grid gap-4 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("klass.maxGrade")}</Label>
          <Input
            type="number"
            value={klass.maxGrade}
            onChange={(e) => updateClass(klass.id, { maxGrade: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("klass.passingGrade")}</Label>
          <Input
            type="number"
            value={klass.passingGrade}
            onChange={(e) => updateClass(klass.id, { passingGrade: Number(e.target.value) || 0 })}
          />
        </div>
      </section>

      <section className="card-soft space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold">{t("klass.schemes")}</h3>
            <p className="text-xs text-muted-foreground">Final grade = the best of all schemes.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => addScheme(klass.id)}>
            <Plus className="size-4" /> {t("klass.addScheme")}
          </Button>
        </div>

        {klass.schemes.map((scheme) => (
          <div key={scheme.id} className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <Input
                value={scheme.name}
                onChange={(e) => updateScheme(klass.id, scheme.id, { name: e.target.value })}
                className="h-9 max-w-48 font-medium"
              />
              <span className="ml-auto text-xs text-muted-foreground">{totalWeight(scheme)}% total</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  removeScheme(klass.id, scheme.id);
                  toast.success(t("toast.deleted"));
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {klass.sections.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                  <Input
                    type="number"
                    value={scheme.weights[s.id] ?? 0}
                    onChange={(e) =>
                      updateScheme(klass.id, scheme.id, {
                        weights: { ...scheme.weights, [s.id]: Number(e.target.value) || 0 },
                      })
                    }
                    className="h-9 w-24"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card-soft space-y-4 p-5">
        <label className="flex items-center gap-3">
          <Switch
            checked={klass.resit.enabled}
            onCheckedChange={(v) => updateClass(klass.id, { resit: { ...klass.resit, enabled: v } })}
          />
          <span className="font-display text-sm font-semibold">{t("klass.resit")}</span>
        </label>

        {klass.resit.enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("klass.resitCondition")}</Label>
              <Input
                value={klass.resit.condition}
                placeholder="(exam_1 + exam_2) / 2 >= 3"
                onChange={(e) => updateClass(klass.id, { resit: { ...klass.resit, condition: e.target.value } })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variables:{" "}
                {klass.sections.map((s) => (
                  <code key={s.id} className="mr-1 rounded bg-muted px-1 py-0.5">
                    {slug(s.name)}
                  </code>
                ))}
              </p>
              <p className={`text-xs ${check.ok ? "text-muted-foreground" : "text-destructive"}`}>
                {check.ok
                  ? check.value
                    ? "Condition currently met ✓"
                    : "Condition not met yet"
                  : `Error: ${check.error}`}
              </p>
            </div>

            {check.ok && check.value && (
              <div className="space-y-2">
                <Label>{t("klass.resitGrade")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={klass.resit.grade ?? ""}
                  onChange={(e) =>
                    updateClass(klass.id, {
                      resit: { ...klass.resit, grade: e.target.value === "" ? null : Number(e.target.value) },
                    })
                  }
                  className="w-32"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("klass.overrides")}</Label>
              <div className="flex flex-wrap gap-2">
                {klass.sections.map((s) => {
                  const on = klass.resit.overrides.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        updateClass(klass.id, {
                          resit: {
                            ...klass.resit,
                            overrides: on
                              ? klass.resit.overrides.filter((o) => o !== s.id)
                              : [...klass.resit.overrides, s.id],
                          },
                        })
                      }
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
