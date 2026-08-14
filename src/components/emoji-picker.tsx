import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
}: {
  value: string;
  onChange: (emoji: string) => void;
  color?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("common.pickEmoji")}
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-xl border border-border text-3xl leading-none transition-colors hover:bg-muted",
            className,
          )}
          style={color ? { backgroundColor: `${color}1f` } : undefined}
        >
          {value || "🙂"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3 p-3" align="start">
        <div className="grid max-h-52 grid-cols-8 gap-1 overflow-y-auto">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onChange(e)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-lg hover:bg-muted",
                value === e && "bg-accent",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="space-y-1 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">{t("common.custom")}</p>
          <Input
            value={value}
            onChange={(ev) => onChange([...ev.target.value].slice(0, 2).join(""))}
            className="h-8 text-center text-lg"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
