import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { caller } from "@/server/caller";
import { TaskForm } from "@/components/TaskForm";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Loaded on the server so the form renders already filled in.
    const task = await caller.tasks.byId({ id });
    return <TaskForm task={task} />;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
