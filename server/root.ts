import { router } from "./trpc";
import { taskRouter } from "./routers/task";

export const appRouter = router({ tasks: taskRouter });

export type AppRouter = typeof appRouter;
