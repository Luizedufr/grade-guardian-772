import type { Klass, Scheme, Section, Settings, StatusCategory } from "./types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Average of a section's items (or the direct grade for exam sections). */
export function sectionGrade(section: Section): number | null {
  if (section.kind === "exam") return section.directGrade;
  const graded = section.items.filter((i) => i.grade !== null && !Number.isNaN(i.grade));
  if (graded.length === 0) return null;
  if (section.weightedItems) {
    const totalWeight = graded.reduce((a, i) => a + (Number(i.weight) || 0), 0);
    if (totalWeight <= 0) return null; // guard: division by zero
    const sum = graded.reduce((a, i) => a + (i.grade as number) * (Number(i.weight) || 0), 0);
    return round2(sum / totalWeight);
  }
  const sum = graded.reduce((a, i) => a + (i.grade as number), 0);
  return round2(sum / graded.length);
}

export function sectionGrades(klass: Klass, overrideValue?: number | null, overrides: string[] = []) {
  const map: Record<string, number | null> = {};
  for (const s of klass.sections) {
    map[s.id] =
      overrides.includes(s.id) && overrideValue !== null && overrideValue !== undefined
        ? overrideValue
        : sectionGrade(s);
  }
  return map;
}

/** Weighted grade for one scheme. Ignores sections without a grade and renormalizes. */
export function schemeGrade(scheme: Scheme, grades: Record<string, number | null>): number | null {
  let weightSum = 0;
  let acc = 0;
  for (const [sectionId, weight] of Object.entries(scheme.weights)) {
    const w = Number(weight) || 0;
    const g = grades[sectionId];
    if (w <= 0 || g === null || g === undefined || Number.isNaN(g)) continue;
    weightSum += w;
    acc += g * w;
  }
  if (weightSum <= 0) return null; // guard: division by zero
  return round2(acc / weightSum);
}

/** Final grade = max over all schemes, with the resit applied when it qualifies. */
export function classGrade(klass: Klass): {
  grade: number | null;
  bestSchemeId: string | null;
  resitQualified: boolean;
  perScheme: Record<string, number | null>;
} {
  const base = sectionGrades(klass);
  const resitQualified = klass.resit.enabled && evaluateCondition(klass.resit.condition, base, klass);
  const useResit = resitQualified && klass.resit.grade !== null;
  const grades = useResit ? sectionGrades(klass, klass.resit.grade, klass.resit.overrides) : base;

  const perScheme: Record<string, number | null> = {};
  let best: number | null = null;
  let bestSchemeId: string | null = null;
  for (const scheme of klass.schemes) {
    const g = schemeGrade(scheme, grades);
    perScheme[scheme.id] = g;
    if (g !== null && (best === null || g > best)) {
      best = g;
      bestSchemeId = scheme.id;
    }
  }
  return { grade: best, bestSchemeId, resitQualified, perScheme };
}

/* ------------------------------------------------------------------ */
/* Tiny safe expression parser for resit conditions                     */
/* Supports: numbers, + - * / ( ), comparisons >= <= > < == !=,          */
/* and && || ; variables are section names (slugified) or section codes. */
/* ------------------------------------------------------------------ */

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

export function conditionVariables(klass: Klass) {
  const vars: Record<string, number | null> = {};
  const grades = sectionGrades(klass);
  for (const s of klass.sections) {
    vars[slug(s.name)] = grades[s.id] ?? null;
  }
  return vars;
}

type Tok = { t: string; v?: number | string };

function tokenize(input: string): Tok[] {
  const tokens: Tok[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i] as string;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < input.length && /[0-9.]/.test(input[j] as string)) j++;
      tokens.push({ t: "num", v: parseFloat(input.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j] as string)) j++;
      tokens.push({ t: "id", v: input.slice(i, j) });
      i = j;
      continue;
    }
    const two = input.slice(i, i + 2);
    if ([">=", "<=", "==", "!=", "&&", "||"].includes(two)) {
      tokens.push({ t: two });
      i += 2;
      continue;
    }
    if ("+-*/()<>".includes(c)) {
      tokens.push({ t: c });
      i++;
      continue;
    }
    throw new Error(`Unexpected character "${c}"`);
  }
  return tokens;
}

function makeParser(tokens: Tok[], vars: Record<string, number | null>) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t: string) => {
    if (peek()?.t === t) {
      pos++;
      return true;
    }
    return false;
  };

  function primary(): number {
    const tok = peek();
    if (!tok) throw new Error("Unexpected end of expression");
    if (tok.t === "num") {
      pos++;
      return tok.v as number;
    }
    if (tok.t === "id") {
      pos++;
      const key = slug(String(tok.v));
      const val = vars[key];
      if (val === undefined) throw new Error(`Unknown variable "${tok.v}"`);
      if (val === null) throw new Error(`No grade yet for "${tok.v}"`);
      return val;
    }
    if (eat("-")) return -primary();
    if (eat("(")) {
      const v = orExpr();
      if (!eat(")")) throw new Error("Missing closing parenthesis");
      return v;
    }
    throw new Error(`Unexpected token "${tok.t}"`);
  }

  function mul(): number {
    let left = primary();
    for (;;) {
      if (eat("*")) left *= primary();
      else if (eat("/")) {
        const r = primary();
        if (r === 0) throw new Error("Division by zero");
        left /= r;
      } else return left;
    }
  }

  function add(): number {
    let left = mul();
    for (;;) {
      if (eat("+")) left += mul();
      else if (eat("-")) left -= mul();
      else return left;
    }
  }

  function cmp(): number {
    const left = add();
    for (const op of [">=", "<=", "==", "!=", ">", "<"]) {
      if (peek()?.t === op) {
        pos++;
        const right = add();
        const res =
          op === ">=" ? left >= right
          : op === "<=" ? left <= right
          : op === ">" ? left > right
          : op === "<" ? left < right
          : op === "==" ? left === right
          : left !== right;
        return res ? 1 : 0;
      }
    }
    return left;
  }

  function andExpr(): number {
    let left = cmp();
    while (eat("&&")) {
      const r = cmp();
      left = left && r ? 1 : 0;
    }
    return left;
  }

  function orExpr(): number {
    let left = andExpr();
    while (eat("||")) {
      const r = andExpr();
      left = left || r ? 1 : 0;
    }
    return left;
  }

  return () => {
    const v = orExpr();
    if (pos < tokens.length) throw new Error("Unexpected trailing input");
    return v;
  };
}

export function evaluateExpression(expr: string, vars: Record<string, number | null>): number {
  return makeParser(tokenize(expr), vars)();
}

export function evaluateCondition(expr: string, _grades: Record<string, number | null>, klass: Klass): boolean {
  if (!expr.trim()) return true;
  try {
    return evaluateExpression(expr, conditionVariables(klass)) !== 0;
  } catch {
    return false;
  }
}

export function checkCondition(expr: string, klass: Klass): { ok: boolean; error?: string; value?: boolean } {
  if (!expr.trim()) return { ok: true, value: true };
  try {
    return { ok: true, value: evaluateExpression(expr, conditionVariables(klass)) !== 0 };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function statusFor(grade: number | null, klass: Klass, settings: Settings): StatusCategory | null {
  if (grade === null) return null;
  const match = settings.statuses.find((s) => grade >= s.min && grade < s.max);
  if (match) return match;
  return grade >= klass.passingGrade
    ? { id: "pass", label: "Pass", min: klass.passingGrade, max: 1e9, color: "#16794a", passing: true }
    : { id: "fail", label: "Fail", min: 0, max: klass.passingGrade, color: "#b3341f", passing: false };
}

export function totalWeight(scheme: Scheme) {
  return Object.values(scheme.weights).reduce((a, b) => a + (Number(b) || 0), 0);
}
