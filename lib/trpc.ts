import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/root";

/** Typed React hooks for every procedure in the router. */
export const trpc = createTRPCReact<AppRouter>();
