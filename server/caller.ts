import { appRouter } from "./root";

/**
 * Server-side caller: invokes procedures as plain functions, with no HTTP hop.
 * This is what the server components use to render the first page of tasks,
 * so the list arrives in the initial HTML (SSR) instead of after hydration.
 */
export const caller = appRouter.createCaller({});
