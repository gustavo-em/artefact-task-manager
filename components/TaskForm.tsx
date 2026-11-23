"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import type { Task } from "@/server/store";

/** One form for both cases: no `task` means create, a `task` means edit. */
export function TaskForm({ task }: { task?: Task }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [titleError, setTitleError] = useState("");

  async function goBackToList() {
    await utils.tasks.list.invalidate();
    router.push("/");
    router.refresh();
  }

  const create = trpc.tasks.create.useMutation({ onSuccess: goBackToList });
  const update = trpc.tasks.update.useMutation({ onSuccess: goBackToList });

  const saving = create.isPending || update.isPending;
  const failure = create.error ?? update.error;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Catches the obvious mistake without a round trip. The same rule is
    // enforced again on the server by the Zod schema, which is the real guard.
    if (!titulo.trim()) {
      setTitleError("Title is required.");
      return;
    }
    setTitleError("");

    if (task) update.mutate({ id: task.id, titulo, descricao });
    else create.mutate({ titulo, descricao });
  }

  return (
    <>
      <div className="row">
        <h1>{task ? "Edit task" : "New task"}</h1>
        <Link className="button" href="/">
          Back
        </Link>
      </div>

      {failure && <p className="alert error">{failure.message}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Title
          <input
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            maxLength={120}
            autoFocus
          />
          {titleError && <small className="error">{titleError}</small>}
        </label>

        <label>
          Description (optional)
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            maxLength={500}
          />
        </label>

        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : task ? "Save changes" : "Create task"}
        </button>
      </form>
    </>
  );
}
