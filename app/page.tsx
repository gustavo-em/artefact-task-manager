import { caller } from "@/server/caller";
import { TaskList } from "@/components/TaskList";
import { PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic"; // the store changes at runtime

export default async function HomePage() {
  // SSR: the first page is resolved on the server through the tRPC caller
  // (no HTTP hop) and ships inside the initial HTML.
  const firstPage = await caller.tasks.list({ limit: PAGE_SIZE });

  return <TaskList firstPage={firstPage} />;
}
