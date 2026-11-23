/**
 * In-memory task store — no database, as the case requires.
 *
 * It hangs off `globalThis` because Next.js reloads modules on every edit in
 * development; without that the list would reset on each hot reload.
 *
 * Field names follow the data model given in the case statement.
 */
export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // epoch milliseconds
};

const TITLES = [
  "Write the sprint report",
  "Review the onboarding flow",
  "Fix the broken avatar upload",
  "Plan the next roadmap",
  "Update the API documentation",
  "Refactor the notification service",
  "Add tests to the checkout flow",
  "Investigate slow dashboard queries",
  "Clean up unused feature flags",
  "Prepare the demo environment",
  "Improve the empty states",
  "Document the release process",
];

// Fictitious data only — the repository is public.
const seed = (): Task[] =>
  TITLES.map((titulo, i) => ({
    id: `seed-${i + 1}`,
    titulo,
    descricao: i % 3 === 0 ? "Seeded example task." : undefined,
    dataCriacao: Date.now() - i * 60 * 60 * 1000, // each one an hour older
  }));

const g = globalThis as { __tasks?: Task[] };

export const tasks: Task[] = (g.__tasks ??= seed());
