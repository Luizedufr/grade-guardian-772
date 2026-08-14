import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LayoutGrid, Layers, Settings } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import i18n from "@/lib/i18n";
import { useAppStore } from "@/store/app-store";

const links = [
  { to: "/", label: "nav.dashboard", icon: LayoutGrid },
  { to: "/semesters", label: "nav.units", icon: Layers },
  { to: "/settings", label: "nav.settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const language = useAppStore((s) => s.settings.language);

  useEffect(() => {
    if (language && i18n.language !== language) void i18n.changeLanguage(language);
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold">{t("app.name")}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-secondary text-foreground",
                  )}
                >
                  <l.icon className="size-4" />
                  <span className="hidden sm:inline">{t(l.label)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
