import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassIcon } from "@/components/class-icon";
import { classIcons } from "@/lib/class-icons";

const EMOJIS = [
  "📘","📗","📕","📙","📚","📝","✏️","🖊️","📐","📏","🧮","🔬",
  "🧪","🧬","🔭","🌍","🗺️","🏛️","⚖️","💼","💰","📈","📊","💻",
  "⌨️","🖥️","🤖","⚙️","🔧","🏗️","🎨","🎭","🎬","🎵","🎸","📷",
  "🩺","💊","🧠","❤️","🏃","⚽","🍳","🌱","☀️","🌙","⭐","🔥",
];

export function EmojiPicker({
  value,
  onChange,
  color,
  className,
  icon,
  onIconChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
  color?: string;
  className?: string;
  icon?: string | undefined;
  onIconChange?: (icon: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const chooseEmoji = (emoji: string) => {
    onIconChange?.(undefined);
    onChange(emoji);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={t("common.pickIcon")}
          className={cn(
            "size-14 shrink-0 rounded-xl bg-[var(--class-icon-background)] p-0 text-3xl leading-none",
            className,
          )}
          style={{ "--class-icon-background": color ? `color-mix(in srgb, ${color} 12%, transparent)` : "var(--muted)" } as CSSProperties}
        >
          <ClassIcon icon={icon} emoji={value} color={color} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-w-[calc(100vw-2rem)] space-y-3 p-3" align="start">
        <Tabs defaultValue={icon ? "tabler" : "emoji"}>
          <TabsList className="w-full">
            <TabsTrigger value="emoji">{t("klass.emoji")}</TabsTrigger>
            <TabsTrigger value="tabler">{t("common.tablerIcons")}</TabsTrigger>
          </TabsList>
          <TabsContent value="tabler">
            <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
              {Object.entries(classIcons).map(([id]) => (
                <Button key={id} type="button" variant="ghost" size="icon"
                  aria-label={t(`icons.${id}`)} title={t(`icons.${id}`)} aria-pressed={icon === id}
                  className={cn("size-9 text-2xl", icon === id && "bg-accent")}
                  onClick={() => { onIconChange?.(id); setOpen(false); }}>
                  <ClassIcon icon={id} emoji={value} color={color} />
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="emoji" className="space-y-3">
        <div className="grid max-h-52 grid-cols-8 gap-1 overflow-y-auto">
          {EMOJIS.map((e) => (
            <Button
              key={e}
              type="button"
              variant="ghost"
              aria-label={e}
              onClick={() => chooseEmoji(e)}
              className={cn(
                "size-7 rounded-md p-0 text-lg",
                !icon && value === e && "bg-accent",
              )}
            >
              {e}
            </Button>
          ))}
        </div>
        <div className="space-y-1 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">{t("common.custom")}</p>
          <Input
            aria-label={t("common.pickEmoji")}
            value={value}
            onChange={(ev) => { onIconChange?.(undefined); onChange([...ev.target.value].slice(0, 2).join("")); }}
            className="h-8 text-center text-lg"
          />
        </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
