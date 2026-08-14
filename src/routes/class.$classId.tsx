import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GradeValue, StatusBadge } from "@/components/grade-bits";
import { ColorPicker } from "@/components/color-picker";
import { EmojiPicker } from "@/components/emoji-picker";
import { SectionsPanel } from "@/components/class/sections-panel";
import { BreakdownPanel } from "@/components/class/breakdown-panel";
import { ClassSettingsPanel } from "@/components/class/class-settings-panel";
import { useHydrated } from "@/hooks/use-hydrated";
import { classGrade } from "@/lib/grading";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/class/$classId")({
  head: () => ({
    meta: [
      { title: "Class detail — Marklet Grade Tracker" },
      { name: "description", content: "Sections, assignments, weighting schemes and resit logic for one class." },
      { property: "og:title", content: "Class detail — Marklet Grade Tracker" },
      { property: "og:description", content: "Sections, assignments, weighting schemes and resit logic for one class." },
    ],
  }),
  component: ClassDetail,
});

function ClassDetail() {
  const { classId } = Route.useParams();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { classes, units, settings, updateClass, removeClass, duplicateClass, addUnit } = useAppStore();
  const klass = classes.find((c) => c.id === classId);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  if (!klass) {
    return (
      <div className="card-soft p-10 text-center">
        <p className="text-sm text-muted-foreground">This class no longer exists.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary underline">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const { grade } = classGrade(klass);

  return (
    <div
      className="space-y-6"
      style={
        {
          "--primary": klass.color,
          "--ring": klass.color,
          "--primary-foreground": "oklch(0.99 0 0)",
          "--accent": `${klass.color}1f`,
          "--sidebar-primary": klass.color,
        } as React.CSSProperties
      }
    >
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("common.back")}
      </Link>

      <header className="card-soft space-y-5 p-6">
        <div className="flex flex-wrap items-start gap-4">
          <EmojiPicker
            value={klass.emoji}
            color={klass.color}
            onChange={(emoji) => updateClass(klass.id, { emoji })}
          />
          <div className="min-w-[12rem] flex-1 space-y-2">
            <Input
              value={klass.name}
              onChange={(e) => updateClass(klass.id, { name: e.target.value })}
              className="h-auto border-transparent bg-transparent px-2 py-1 font-display !text-3xl font-semibold shadow-none focus-visible:border-input sm:!text-4xl"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={klass.code}
                placeholder={t("klass.code")}
                onChange={(e) => updateClass(klass.id, { code: e.target.value })}
                className="h-8 w-32 text-xs"
              />
              <Input
                type="number"
                value={klass.credits}
                onChange={(e) => updateClass(klass.id, { credits: Number(e.target.value) || 0 })}
                className="h-8 w-24 text-xs"
              />
              <ColorPicker value={klass.color} onChange={(color) => updateClass(klass.id, { color })} />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("klass.finalGrade")}</p>
            <GradeValue value={grade} max={klass.maxGrade} className="text-3xl font-semibold" />
            <div className="mt-2 flex justify-end">
              <StatusBadge klass={klass} settings={settings} />
            </div>
          </div>
        </div>

        <Textarea
          value={klass.description}
          placeholder={t("klass.description")}
          onChange={(e) => updateClass(klass.id, { description: e.target.value })}
          className="min-h-16 resize-none text-sm"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={klass.active} onCheckedChange={(v) => updateClass(klass.id, { active: v })} />
            {t("klass.active")}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("units.title")}</span>
            <Select value={klass.unitId} onValueChange={(v) => updateClass(klass.id, { unitId: v })}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <DuplicateButton classId={klass.id} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                removeClass(klass.id);
                toast.success(t("toast.deleted"));
                void navigate({ to: "/" });
              }}
            >
              <Trash2 className="size-4 text-destructive" /> {t("common.delete")}
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="sections">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="sections">{t("klass.sections")}</TabsTrigger>
          <TabsTrigger value="breakdown">{t("klass.breakdown")}</TabsTrigger>
          <TabsTrigger value="settings">{t("klass.settings")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-4">
          <SectionsPanel klass={klass} />
        </TabsContent>
        <TabsContent value="breakdown" className="mt-4">
          <BreakdownPanel klass={klass} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <ClassSettingsPanel klass={klass} />
        </TabsContent>
      </Tabs>
    </div>
  );

  function DuplicateButton({ classId: id }: { classId: string }) {
    return (
      <Select
        onValueChange={(unitId) => {
          const target = unitId === "__new" ? addUnit(`Semester ${units.length + 1}`).id : unitId;
          const copy = duplicateClass(id, target);
          if (!copy) {
            toast.error(t("toast.error"));
            return;
          }
          toast.success(t("toast.duplicated"));
          void navigate({ to: "/class/$classId", params: { classId: copy.id } });
        }}
      >
        <SelectTrigger className="h-8 w-auto gap-2 border-none bg-secondary px-3 text-xs">
          <Copy className="size-3.5" /> {t("klass.duplicate")}
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
          <SelectItem value="__new">
            <span className="flex items-center gap-1">
              <Plus className="size-3" /> New semester
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }
}
