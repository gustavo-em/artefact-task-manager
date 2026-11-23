"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { PAGE_SIZE } from "@/lib/constants";
import type { Task } from "@/server/store";

type Page = { items: Task[]; nextCursor: string | null };

const formatDate = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(ms);

export function TaskList({ firstPage }: { firstPage: Page }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [deleted, setDeleted] = useState<string | null>(null);

  const query = trpc.tasks.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      // The server component already resolved page 1, so the first paint has
      // real content. React Query owns every fetch after that.
      initialData: { pages: [firstPage], pageParams: [null] },
      getNextPageParam: (page) => page.nextCursor ?? undefined,
      refetchOnMount: "always",
    },
  );

  const remove = trpc.tasks.delete.useMutation({
    onSuccess: async (task) => {
      setDeleted(task.titulo);
      await utils.tasks.list.invalidate();
      router.refresh(); // keep the server-rendered page in sync
    },
  });

  // Infinite scroll: fetch the next page when the sentinel enters the viewport.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tasks = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <div className="row">
        <h1>Tasks</h1>
        <Link className="button primary" href="/tasks/new">
          New task
        </Link>
      </div>

      {deleted && <p className="alert ok">&ldquo;{deleted}&rdquo; was deleted.</p>}
      {remove.isError && <p className="alert error">{remove.error.message}</p>}
      {query.isError && <p className="alert error">Could not load the tasks.</p>}

      {tasks.map((task) => (
        <article className="card" key={task.id}>
          <div className="grow">
            <strong>{task.titulo}</strong>
            {task.descricao && <p>{task.descricao}</p>}
            <small>{formatDate(task.dataCriacao)}</small>
          </div>
          <Link className="button" href={`/tasks/${task.id}/edit`}>
            Edit
          </Link>
          <button
            className="danger"
            disabled={remove.isPending && remove.variables?.id === task.id}
            onClick={() => {
              setDeleted(null);
              remove.mutate({ id: task.id });
            }}
          >
            Delete
          </button>
        </article>
      ))}

      {tasks.length === 0 && <p className="center">No tasks yet. Create the first one.</p>}

      <div ref={sentinel} />
      <p className="center">
        {isFetchingNextPage ? "Loading more…" : hasNextPage ? "" : "End of the list."}
      </p>
    </>
  );
}
