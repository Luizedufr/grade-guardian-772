# GradeBook Smart

**System Context & Tech Stack:**

You are an expert React developer. Build a modern, minimalist Grade Tracking web application. Use React, Tailwind CSS, and Shadcn UI components. For state management and persistence, use Zustand with the `persist` middleware to save all data strictly to `localStorage` (100% client-side, zero server costs). Set up an i18n framework (e.g., `react-i18next`) with English as the default and scaffolding for future Spanish support. Implement a Theme Provider for Light/Dark/System mode toggling.

**Core Data Models:**

Design the application state around these hierarchical entities:

1. **Global Settings:** Default grading scale, default passing grade, and custom global status categories (e.g., "Pass" >= 5, "Fail" < 4, "Compensation" 4 <= x < 5).

2. **Grading Units (e.g., Semesters):** Containers for classes.

3. **Classes:** 

   * **Properties:** Name, short description (optional), class code, emoji, credit value, custom theme color.

   * **Statuses:** A primary status (Passed/Failed/Custom based on global settings) AND an independent "Active" boolean status (currently taking vs. historical).

   * **Duplication:** Allow users to duplicate an existing class (copying its grading structure) into a new or existing semester.

4. **Grading Structures (Inside Classes):**

   * **Sections:** Categories of work (e.g., Homework, Projects). Sections have a percentage weight of the total grade.

   * **Special Section (Exams):** A section with no sub-items, just a direct input for the final section grade.

   * **Standard Section Items (Assignments):** Users can add infinite items to a section. 

   * **Section Weighting Logic:** By default, a section grade is the unweighted average of its items. Provide a toggle for "Weighted Items" within a section (e.g., Project 1 is 60%, Project 2 is 40%). If toggled, the user must input the specific weight when creating/editing the assignment.

**Advanced Grading Logic:**

Implement the following mathematical and logical features for class grading:

1. **Maximum Grade System (Multiple Schemes):** Allow users to define multiple grading schemes for a single class. The final grade should be calculated as max(Scheme 1, Scheme 2, ..., Scheme n). For example: Scheme 1 (Homework 20%, Midterm 30%, Final 50%) vs. Scheme 2 (Midterm 40%, Final 60%).

2. **Conditional Resit Logic:** Add an optional "Resit" toggle per class. If enabled, allow the user to define a custom mathematical condition to qualify for the resit. Provide a formula builder or text parser for conditions, such as: (Exam 1 + Exam 2) / (Weight 1 + Weight 2) >= 3. If the condition is met, reveal a new input for the Resit Exam grade, which dynamically overrides the necessary components based on user definition.

**UI & Views (Minimalist & Modern):**

1. **Dashboard (Home):**

   * A summary header showing Global GPA/Average (toggleable: including vs. excluding failed subjects) and Total Passed Credits.

   * A grid/list of "Active" classes displaying their emoji, name, color, and current calculated grade.

   * Clicking a class card navigates to the Class Detail View.

2. **Class Detail View:**

   * A clean header with the class details (emoji, name, code, description, active toggle).

   * Visual breakdown of the grading structure (donut chart or clean progress bars).

   * Manage sections and assignments (CRUD operations for items).

   * Settings tab for the specific class (configure multiple schemes, resit formulas, pass/fail thresholds).

3. **Semesters/Units View:** A chronological list of all units and their nested classes.

4. **Global Settings Modal/Page:** Manage theme, language, and default global grading rules.

**Additional Requirements:**

* Ensure the UI is highly responsive and mobile-friendly.

* Use clean typography, ample whitespace, and subtle borders/shadows to achieve the modern minimalist aesthetic.

* Use toast notifications for creation, deletion, and error handling.

* Ensure math calculations handle edge cases (e.g., division by zero if weights are empty).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d5a37b43-1cab-46c1-911b-610f4bf0f345).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
