import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme, type Theme } from "@/components/theme-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAppStore } from "@/store/app-store";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Marklet Grade Tracker" },
      { name: "description", content: "Theme, language and default grading rules for every new class." },
      { property: "og:title", content: "Settings — Marklet Grade Tracker" },
      { property: "og:description", content: "Theme, language and default grading rules for every new class." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, setStatuses, resetAll } = useAppStore();

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">{t("settings.title")}</h1>

      <section className="card-soft space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">{t("settings.appearance")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("settings.theme")}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("settings.light")}</SelectItem>
                <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                <SelectItem value="system">{t("settings.system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("settings.language")}</Label>
            <Select
              value={settings.language}
              onValueChange={(v) => {
                updateSettings({ language: v });
                void i18n.changeLanguage(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (beta)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="card-soft space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">{t("settings.grading")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("klass.maxGrade")}</Label>
            <Input
              type="number"
              value={settings.defaultMaxGrade}
              onChange={(e) => updateSettings({ defaultMaxGrade: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("klass.passingGrade")}</Label>
            <Input
              type="number"
              value={settings.defaultPassingGrade}
              onChange={(e) => updateSettings({ defaultPassingGrade: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </section>

      <section className="card-soft space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t("settings.statuses")}</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setStatuses([
                ...settings.statuses,
                {
                  id: Math.random().toString(36).slice(2, 8),
                  label: "New status",
                  min: 0,
                  max: 1,
                  color: "#1d4ed8",
                  passing: false,
                },
              ])
            }
          >
            <Plus className="size-4" /> {t("settings.addStatus")}
          </Button>
        </div>
        <div className="space-y-3">
          {settings.statuses.map((s, idx) => (
            <div key={s.id} className="grid grid-cols-2 items-end gap-3 rounded-xl border border-border p-3 sm:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">{t("settings.label")}</Label>
                <Input
                  value={s.label}
                  onChange={(e) => {
                    const next = [...settings.statuses];
                    next[idx] = { ...s, label: e.target.value };
                    setStatuses(next);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("settings.min")}</Label>
                <Input
                  type="number"
                  value={s.min}
                  onChange={(e) => {
                    const next = [...settings.statuses];
                    next[idx] = { ...s, min: Number(e.target.value) };
                    setStatuses(next);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("settings.max")}</Label>
                <Input
                  type="number"
                  value={s.max}
                  onChange={(e) => {
                    const next = [...settings.statuses];
                    next[idx] = { ...s, max: Number(e.target.value) };
                    setStatuses(next);
                  }}
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-xs">
                <Switch
                  checked={s.passing}
                  onCheckedChange={(v) => {
                    const next = [...settings.statuses];
                    next[idx] = { ...s, passing: v };
                    setStatuses(next);
                  }}
                />
                {t("settings.passing")}
              </label>
              <div className="flex items-center gap-2 pb-1">
                <ColorPicker
                  value={s.color}
                  onChange={(color) => {
                    const next = [...settings.statuses];
                    next[idx] = { ...s, color };
                    setStatuses(next);
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setStatuses(settings.statuses.filter((x) => x.id !== s.id));
                    toast.success(t("toast.deleted"));
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-soft space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold">{t("settings.data")}</h2>
        <p className="text-sm text-muted-foreground">
          Everything is stored locally in this browser. Nothing leaves your device.
        </p>
        <Button
          variant="destructive"
          onClick={() => {
            resetAll();
            toast.success(t("toast.deleted"));
          }}
        >
          {t("settings.reset")}
        </Button>
      </section>
    </div>
  );
}
