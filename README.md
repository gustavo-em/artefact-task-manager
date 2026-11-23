# Task Manager — Next.js 15 + tRPC

A small task manager built for the Artefact written case. The backend keeps the
task list **in memory** (no database, as the statement requires) and exposes it
over **tRPC**; the frontend is a **Next.js 15** App Router application that
server-renders the first page of the list.

All data in this repository is fictitious.

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. Other scripts: `npm run build`, `npm start`,
`npm run typecheck`.

## What it does

| Requirement | Where |
| --- | --- |
| Create / list / update / delete over tRPC | `server/routers/task.ts` |
| Title is mandatory, meaningful errors on failure | `server/routers/task.ts`, `components/TaskForm.tsx` |
| List page pre-loaded with SSR | `app/page.tsx` → `server/caller.ts` |
| Create / edit form with hooks and validation | `components/TaskForm.tsx` |
| Delete from the list with visual feedback | `components/TaskList.tsx` |
| Infinite scroll (bonus) | `components/TaskList.tsx` |

## Structure

```
app/
  page.tsx                  list page — server component, SSR
  tasks/new/page.tsx        create form
  tasks/[id]/edit/page.tsx  edit form, loads the task on the server
  api/trpc/[trpc]/route.ts  tRPC HTTP endpoint for the browser
  providers.tsx             React Query + tRPC client providers
components/
  TaskList.tsx              list, delete, infinite scroll
  TaskForm.tsx              one form for create and edit
server/
  store.ts                  in-memory store (seeded with 12 tasks)
  trpc.ts                   tRPC init
  routers/task.ts           procedures and Zod validation
  caller.ts                 server-side caller used by the SSR pages
lib/
  trpc.ts                   typed React hooks
```

## Design decisions

**SSR without an HTTP round trip.** The list page is a server component that
calls the router through `appRouter.createCaller({})`, so the first page of
tasks is resolved in the same process that renders the HTML. The browser
receives the tasks already painted; React Query then adopts that payload as
`initialData` and owns every later fetch. Hitting `/api/trpc` from the server
would have worked too, but it would mean the server calling itself over the
network for data it already has.

**Cursor pagination instead of offset.** `tasks.list` takes the id of the last
item seen and returns the following page plus a `nextCursor`. With offsets,
deleting an item while scrolling shifts every later page by one and the user
silently skips a task; a cursor anchored on an id does not drift.

**Validation lives on the server, and is repeated on the client.** The Zod
schema in the router is the single source of truth — a direct tRPC call cannot
bypass it. The form repeats the "title is required" check so the obvious
mistake is caught without a round trip, and the server's message is shown when
anything else fails.

**`dataCriacao` is a number.** Epoch milliseconds cross the wire as plain JSON,
so the project needs no superjson transformer. The UI formats the date with
`Intl.DateTimeFormat`.

**Field names are Portuguese on purpose.** `titulo`, `descricao` and
`dataCriacao` are the names given in the case statement, so they are kept
verbatim. Everything else — code, comments, UI — is in English.

**The store survives hot reloads.** The array is attached to `globalThis`,
otherwise every edit in development would reset the list. Restarting the server
does reset it: that is what "in memory" means here.

## Trade-offs

Deliberately left out, because the case asks for the simplest thing that works:
no database, no auth, no optimistic updates (the list refetches after each
mutation), no test suite, and no component library — plain CSS with a dark mode
that follows the system theme.

With more than one server instance the in-memory store would diverge per
process; a real deployment would move it behind a shared store.
