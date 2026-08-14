import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GradeItem, Klass, Scheme, Section, Settings, StatusCategory, Unit } from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 10);

const COLORS = ["#c2410c", "#0f766e", "#1d4ed8", "#9333ea", "#b45309", "#be123c", "#15803d"];

export const defaultSettings: Settings = {
  defaultMaxGrade: 10,
  defaultPassingGrade: 5,
  language: "en",
  includeFailedInAverage: true,
  statuses: [
    { id: "pass", label: "Pass", min: 5, max: 1e9, color: "#15803d", passing: true },
    { id: "comp", label: "Compensation", min: 4, max: 5, color: "#b45309", passing: false },
    { id: "fail", label: "Fail", min: -1e9, max: 4, color: "#be123c", passing: false },
  ],
};

function makeSection(name: string, kind: Section["kind"] = "standard"): Section {
  return { id: uid(), name, kind, weightedItems: false, directGrade: null, items: [] };
}

function newClass(unitId: string, settings: Settings, index = 0): Klass {
  const sections = [makeSection("Homework"), makeSection("Final exam", "exam")];
  return {
    id: uid(),
    unitId,
    name: "New class",
    description: "",
    code: "",
    emoji: "📘",
    credits: 6,
    color: COLORS[index % COLORS.length] as string,
    active: true,
    maxGrade: settings.defaultMaxGrade,
    passingGrade: settings.defaultPassingGrade,
    sections,
    schemes: [
      {
        id: uid(),
        name: "Scheme 1",
        weights: { [sections[0]!.id]: 40, [sections[1]!.id]: 60 },
      },
    ],
    resit: { enabled: false, condition: "", grade: null, overrides: [] },
    createdAt: Date.now(),
  };
}

type State = {
  settings: Settings;
  units: Unit[];
  classes: Klass[];
  addUnit: (name: string) => Unit;
  renameUnit: (id: string, name: string) => void;
  removeUnit: (id: string) => void;
  addClass: (unitId: string) => Klass;
  updateClass: (id: string, patch: Partial<Klass>) => void;
  removeClass: (id: string) => void;
  duplicateClass: (id: string, unitId: string) => Klass | null;
  addSection: (classId: string, kind: Section["kind"]) => void;
  updateSection: (classId: string, sectionId: string, patch: Partial<Section>) => void;
  removeSection: (classId: string, sectionId: string) => void;
  addItem: (classId: string, sectionId: string) => void;
  updateItem: (classId: string, sectionId: string, itemId: string, patch: Partial<GradeItem>) => void;
  removeItem: (classId: string, sectionId: string, itemId: string) => void;
  addScheme: (classId: string) => void;
  updateScheme: (classId: string, schemeId: string, patch: Partial<Scheme>) => void;
  removeScheme: (classId: string, schemeId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setStatuses: (statuses: StatusCategory[]) => void;
  resetAll: () => void;
};

const mapClass = (classes: Klass[], id: string, fn: (k: Klass) => Klass) =>
  classes.map((k) => (k.id === id ? fn(k) : k));

const mapSection = (k: Klass, sectionId: string, fn: (s: Section) => Section): Klass => ({
  ...k,
  sections: k.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
});

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      units: [],
      classes: [],

      addUnit: (name) => {
        const unit: Unit = { id: uid(), name: name || "New semester", createdAt: Date.now() };
        set((s) => ({ units: [...s.units, unit] }));
        return unit;
      },
      renameUnit: (id, name) =>
        set((s) => ({ units: s.units.map((u) => (u.id === id ? { ...u, name } : u)) })),
      removeUnit: (id) =>
        set((s) => ({
          units: s.units.filter((u) => u.id !== id),
          classes: s.classes.filter((c) => c.unitId !== id),
        })),

      addClass: (unitId) => {
        const k = newClass(unitId, get().settings, get().classes.length);
        set((s) => ({ classes: [...s.classes, k] }));
        return k;
      },
      updateClass: (id, patch) => set((s) => ({ classes: mapClass(s.classes, id, (k) => ({ ...k, ...patch })) })),
      removeClass: (id) => set((s) => ({ classes: s.classes.filter((c) => c.id !== id) })),
      duplicateClass: (id, unitId) => {
        const src = get().classes.find((c) => c.id === id);
        if (!src) return null;
        const idMap: Record<string, string> = {};
        const sections = src.sections.map((s) => {
          const nid = uid();
          idMap[s.id] = nid;
          return {
            ...s,
            id: nid,
            directGrade: null,
            items: s.items.map((i) => ({ ...i, id: uid(), grade: null })),
          };
        });
        const copy: Klass = {
          ...src,
          id: uid(),
          unitId,
          name: `${src.name} (copy)`,
          createdAt: Date.now(),
          sections,
          schemes: src.schemes.map((sc) => ({
            ...sc,
            id: uid(),
            weights: Object.fromEntries(
              Object.entries(sc.weights).map(([k, v]) => [idMap[k] ?? k, v]),
            ),
          })),
          resit: {
            ...src.resit,
            grade: null,
            overrides: src.resit.overrides.map((o) => idMap[o] ?? o),
          },
        };
        set((s) => ({ classes: [...s.classes, copy] }));
        return copy;
      },

      addSection: (classId, kind) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => ({
            ...k,
            sections: [...k.sections, makeSection(kind === "exam" ? "Exam" : "New section", kind)],
          })),
        })),
      updateSection: (classId, sectionId, patch) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => mapSection(k, sectionId, (sec) => ({ ...sec, ...patch }))),
        })),
      removeSection: (classId, sectionId) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => ({
            ...k,
            sections: k.sections.filter((sec) => sec.id !== sectionId),
            schemes: k.schemes.map((sc) => {
              const weights = { ...sc.weights };
              delete weights[sectionId];
              return { ...sc, weights };
            }),
            resit: { ...k.resit, overrides: k.resit.overrides.filter((o) => o !== sectionId) },
          })),
        })),

      addItem: (classId, sectionId) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) =>
            mapSection(k, sectionId, (sec) => ({
              ...sec,
              items: [...sec.items, { id: uid(), name: `Item ${sec.items.length + 1}`, grade: null, weight: 1 }],
            })),
          ),
        })),
      updateItem: (classId, sectionId, itemId, patch) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) =>
            mapSection(k, sectionId, (sec) => ({
              ...sec,
              items: sec.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
            })),
          ),
        })),
      removeItem: (classId, sectionId, itemId) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) =>
            mapSection(k, sectionId, (sec) => ({ ...sec, items: sec.items.filter((i) => i.id !== itemId) })),
          ),
        })),

      addScheme: (classId) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => ({
            ...k,
            schemes: [...k.schemes, { id: uid(), name: `Scheme ${k.schemes.length + 1}`, weights: {} }],
          })),
        })),
      updateScheme: (classId, schemeId, patch) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => ({
            ...k,
            schemes: k.schemes.map((sc) => (sc.id === schemeId ? { ...sc, ...patch } : sc)),
          })),
        })),
      removeScheme: (classId, schemeId) =>
        set((s) => ({
          classes: mapClass(s.classes, classId, (k) => ({
            ...k,
            schemes: k.schemes.filter((sc) => sc.id !== schemeId),
          })),
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setStatuses: (statuses) => set((s) => ({ settings: { ...s.settings, statuses } })),
      resetAll: () => set({ settings: defaultSettings, units: [], classes: [] }),
    }),
    {
      name: "marklet-store",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage,
      ),
      skipHydration: false,
    },
  ),
);

export const CLASS_COLORS = COLORS;
