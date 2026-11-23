import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/root";

/** Single HTTP entry point consumed by the browser client. */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
