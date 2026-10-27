import type { CSSProperties } from "react";
import { getClassIcon } from "@/lib/class-icons";
import { cn } from "@/lib/utils";

export function ClassIcon({ icon, emoji, color, className }: {
  icon?: string; emoji: string; color?: string; className?: string;
}) {
  const Icon = getClassIcon(icon);
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center text-[var(--class-icon-color)]", className)}
      style={{ "--class-icon-color": color ?? "var(--primary)" } as CSSProperties}>
      {Icon ? <Icon className="size-[1em]" stroke={1.8} aria-hidden="true" /> : emoji || "📘"}
    </span>
  );
}