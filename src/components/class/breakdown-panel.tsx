import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { classGrade, sectionGrade, totalWeight } from "@/lib/grading";
import type { Klass } from "@/lib/types";

export function BreakdownPanel({ klass }: { klass: Klass }) {
  const { t } = useTranslation();
  const { grade, bestSchemeId, perScheme, resitQualified } = classGrade(klass);
  const best = klass.schemes.find((s) => s.id === bestSchemeId) ?? klass.schemes[0];
  const total = best ? totalWeight(best) : 0;

  const data = klass.sections
    .map((s) => ({
      name: s.name,
      weight: best ? Number(best.weights[s.id]) || 0 : 0,
      grade: sectionGrade(s),
    }))
    .filter((d) => d.weight > 0);

  const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="card-soft flex flex-col items-center justify-center p-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add section weights to see the breakdown.</p>
        ) : (
          <>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="weight" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={palette[i % palette.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
              {grade === null ? "—" : grade.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {best?.name} · {total}% assigned
            </p>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="card-soft space-y-3 p-5">
          {klass.sections.map((s) => {
            const g = sectionGrade(s);
            const w = best ? Number(best.weights[s.id]) || 0 : 0;
            const pct = g === null ? 0 : Math.max(0, Math.min(100, (g / klass.maxGrade) * 100));
            return (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {s.name} <span className="text-muted-foreground">· {w}%</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{g === null ? "—" : g.toFixed(2)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: klass.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-soft space-y-2 p-5">
          <h3 className="font-display text-sm font-semibold">{t("klass.schemes")}</h3>
          {klass.schemes.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className={s.id === bestSchemeId ? "font-medium" : "text-muted-foreground"}>
                {s.name} {s.id === bestSchemeId && "· best"}
              </span>
              <span className="tabular-nums">{perScheme[s.id] === null ? "—" : perScheme[s.id]?.toFixed(2)}</span>
            </div>
          ))}
          {klass.resit.enabled && (
            <p className="pt-2 text-xs text-muted-foreground">
              {resitQualified ? "Resit condition met — resit grade applied." : "Resit condition not met."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
