import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const en = {
  translation: {
    app: { name: "Marklet", tagline: "Grade tracking, minus the spreadsheet." },
    nav: { dashboard: "Dashboard", units: "Semesters", settings: "Settings" },
    dashboard: {
      average: "Global average",
      passedCredits: "Passed credits",
      activeClasses: "Active classes",
      includeFailed: "Include failed",
      empty: "No active classes yet. Create one to get started.",
      newClass: "New class",
    },
    units: {
      title: "Semesters",
      subtitle: "Every grading unit and the classes inside it.",
      new: "New semester",
      name: "Semester name",
      empty: "No semesters yet.",
      noClasses: "No classes in this semester.",
    },
    klass: {
      name: "Name",
      code: "Code",
      description: "Description",
      emoji: "Emoji",
      credits: "Credits",
      color: "Color",
      active: "Active",
      duplicate: "Duplicate",
      delete: "Delete",
      sections: "Sections",
      breakdown: "Breakdown",
      settings: "Settings",
      addSection: "Add section",
      addItem: "Add item",
      weightedItems: "Weighted items",
      examSection: "Exam section (single grade)",
      finalGrade: "Final grade",
      noGrade: "—",
      schemes: "Grading schemes",
      addScheme: "Add scheme",
      resit: "Resit",
      resitCondition: "Resit condition",
      resitGrade: "Resit grade",
      overrides: "Sections replaced by the resit grade",
      passingGrade: "Passing grade",
      maxGrade: "Maximum grade",
    },
    settings: {
      title: "Settings",
      appearance: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      language: "Language",
      grading: "Default grading",
      statuses: "Status categories",
      addStatus: "Add status",
      label: "Label",
      min: "Min",
      max: "Max",
      passing: "Counts as passed",
      data: "Data",
      reset: "Reset all data",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      weight: "Weight",
      grade: "Grade",
      of: "of",
      back: "Back",
    },
    toast: {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      duplicated: "Class duplicated",
      error: "Something went wrong",
    },
  },
};

// Scaffolding for future Spanish support — keys fall back to English.
export const es = { translation: {} };

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en, es },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
