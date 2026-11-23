import { z } from "zod";
import { publicProcedure, router, TRPCError } from "../trpc";
import { tasks, type Task } from "../store";

/** A non-empty title is the only hard rule in the case statement. */
const titulo = z.string().trim().min(1, "Title is required.").max(120);

/** An empty textarea arrives as "" — store that as "no description". */
const descricao = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => value || undefined);

function indexOf(id: string): number {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TRPCError({ code: "NOT_FOUND", message: `Task "${id}" does not exist.` });
  }
  return index;
}

export const taskRouter = router({
  /**
   * Newest first, paginated by the id of the last item seen. A cursor is used
   * instead of an offset so that deleting a task mid-scroll does not shift the
   * remaining pages and silently skip an item.
   */
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50), cursor: z.string().nullish() }))
    .query(({ input }) => {
      const all = [...tasks].sort((a, b) => b.dataCriacao - a.dataCriacao);
      const start = input.cursor ? all.findIndex((t) => t.id === input.cursor) + 1 : 0;
      const items = all.slice(start, start + input.limit);
      const hasMore = start + input.limit < all.length;

      // null, not undefined, so react-query stops asking for more pages.
      return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => tasks[indexOf(input.id)]),

  create: publicProcedure.input(z.object({ titulo, descricao })).mutation(({ input }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao,
      dataCriacao: Date.now(),
    };
    tasks.push(task);
    return task;
  }),

  update: publicProcedure
    .input(z.object({ id: z.string(), titulo, descricao }))
    .mutation(({ input }) => {
      const index = indexOf(input.id);
      tasks[index] = { ...tasks[index], titulo: input.titulo, descricao: input.descricao };
      return tasks[index];
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const [removed] = tasks.splice(indexOf(input.id), 1);
    return removed;
  }),
});
