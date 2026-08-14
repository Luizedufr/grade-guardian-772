import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { sectionGrade } from "@/lib/grading";
import type { Klass } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export function SectionsPanel({ klass }: { klass: Klass }) {
  const { t } = useTranslation();
  const { addSection, updateSection, removeSection, addItem, updateItem, removeItem } = useAppStore();

  const num = (v: string) => (v === "" ? null : Number(v));

  return (
    <div className="space-y-4">
      {klass.sections.map((section) => {
        const grade = sectionGrade(section);
        return (
          <section key={section.id} className="card-soft overflow-hidden">
            <header className="flex flex-wrap items-center gap-3 border-b border-border/70 px-4 py-3">
              <Input
                value={section.name}
                onChange={(e) => updateSection(klass.id, section.id, { name: e.target.value })}
                className="h-9 w-48 border-transparent bg-transparent px-2 font-display font-semibold shadow-none focus-visible:border-input"
              />
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                {section.kind === "exam" ? "exam" : "items"}
              </span>
              {section.kind === "standard" && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={section.weightedItems}
                    onCheckedChange={(v) => updateSection(klass.id, section.id, { weightedItems: v })}
                  />
                  {t("klass.weightedItems")}
                </label>
              )}
              <span className="ml-auto font-display text-sm tabular-nums">
                {grade === null ? "—" : grade.toFixed(2)}
                <span className="text-muted-foreground"> / {klass.maxGrade}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  removeSection(klass.id, section.id);
                  toast.success(t("toast.deleted"));
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </header>

            {section.kind === "exam" ? (
              <div className="flex items-center gap-3 px-4 py-4">
                <span className="text-sm text-muted-foreground">{t("common.grade")}</span>
                <Input
                  type="number"
                  step="0.01"
                  value={section.directGrade ?? ""}
                  onChange={(e) => updateSection(klass.id, section.id, { directGrade: num(e.target.value) })}
                  className="w-28"
                />
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-border/70">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(klass.id, section.id, item.id, { name: e.target.value })}
                        className="h-9 min-w-32 flex-1 border-transparent bg-transparent px-2 text-sm shadow-none focus-visible:border-input"
                      />
                      {section.weightedItems && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{t("common.weight")}</span>
                          <Input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              updateItem(klass.id, section.id, item.id, { weight: Number(e.target.value) || 0 })
                            }
                            className="h-9 w-20 text-sm"
                          />
                        </div>
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="—"
                        value={item.grade ?? ""}
                        onChange={(e) => updateItem(klass.id, section.id, item.id, { grade: num(e.target.value) })}
                        className="h-9 w-24 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          removeItem(klass.id, section.id, item.id);
                          toast.success(t("toast.deleted"));
                        }}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border/70 px-4 py-3">
                  <Button size="sm" variant="secondary" onClick={() => addItem(klass.id, section.id)}>
                    <Plus className="size-4" /> {t("klass.addItem")}
                  </Button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            addSection(klass.id, "standard");
            toast.success(t("toast.created"));
          }}
        >
          <Plus className="size-4" /> {t("klass.addSection")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            addSection(klass.id, "exam");
            toast.success(t("toast.created"));
          }}
        >
          <Plus className="size-4" /> {t("klass.examSection")}
        </Button>
      </div>
    </div>
  );
}
