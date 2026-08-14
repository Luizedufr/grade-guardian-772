import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const PALETTE = [
  "#64748b",
  "#475569",
  "#0ea5e9",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#c026d3",
  "#e11d48",
  "#f97316",
  "#f59e0b",
  "#65a30d",
  "#059669",
  "#0d9488",
  "#0891b2",
];

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Pick a color"
          className={cn(
            "size-8 shrink-0 rounded-full border border-border shadow-sm transition-transform hover:scale-105",
            className,
          )}
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3 p-3" align="start">
        <div className="grid grid-cols-7 gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => onChange(c)}
              className="flex size-6 items-center justify-center rounded-full border border-border/60 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            >
              {value.toLowerCase() === c && <Check className="size-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span
            className="relative size-6 overflow-hidden rounded-full border border-border"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </span>
          Custom color
          <code className="ml-auto rounded bg-muted px-1 py-0.5">{value}</code>
        </label>
      </PopoverContent>
    </Popover>
  );
}
