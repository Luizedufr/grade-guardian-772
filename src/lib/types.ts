export type StatusCategory = {
  id: string;
  label: string;
  min: number;
  max: number;
  color: string; // token-ish hue string, e.g. "emerald"
  passing: boolean;
};

export type GradeItem = {
  id: string;
  name: string;
  grade: number | null;
  weight: number; // used only when section.weightedItems
};

export type Section = {
  id: string;
  name: string;
  kind: "standard" | "exam";
  weightedItems: boolean;
  directGrade: number | null; // exam sections
  items: GradeItem[];
};

export type Scheme = {
  id: string;
  name: string;
  weights: Record<string, number>; // sectionId -> percentage
};

export type Resit = {
  enabled: boolean;
  condition: string; // e.g. "(s1 + s2) / 2 >= 3"
  grade: number | null;
  overrides: string[]; // section ids replaced by the resit grade
};

export type Klass = {
  id: string;
  unitId: string;
  name: string;
  description: string;
  code: string;
  emoji: string;
  icon?: string | undefined; // Optional Tabler icon identifier; missing means use the emoji.
  credits: number;
  color: string; // hex
  active: boolean;
  maxGrade: number;
  passingGrade: number;
  sections: Section[];
  schemes: Scheme[];
  resit: Resit;
  createdAt: number;
};

export type Unit = {
  id: string;
  name: string;
  createdAt: number;
};

export type Settings = {
  defaultMaxGrade: number;
  defaultPassingGrade: number;
  statuses: StatusCategory[];
  language: string;
  includeFailedInAverage: boolean;
};
