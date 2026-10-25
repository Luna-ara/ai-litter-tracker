<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Instructions for AI coding assistants (Claude, Cursor, Copilot, ChatGPT, Codex, …)

CivicBounty is a hackathon app built overnight by **three people working in parallel**. The
most important rule is **don't create merge conflicts**: only touch files your human owns.

## Read before writing any code

1. `docs/CONTRACTS.md`: schema, types, shared helper signatures, API shapes, **file ownership**
2. The runbook for the person you're helping: `docs/lanes/rohan-citizen.md` (Rohan, using Codex),
   `docs/lanes/luna-government.md` (Luna, using Claude Code), or `docs/lanes/carter-foundation.md`.
   Each task there has a spec and a "Done when" list. Implement exactly that task, nothing more.
3. `docs/ROADMAP.md` for context and timing, if needed

## Hard rules

1. **Stay inside the owner's paths** (CONTRACTS §2). If a change outside them seems necessary,
   don't make it. Stop and write out the exact change so the human can post
   `CONTRACT CHANGE: …` to the team. Verify with `npm run check:lane -- <rohan|luna>` before you finish.
2. **Never change an exported signature, a DB column, or an API shape** from CONTRACTS.md.
   Other people's code depends on them right now.
3. **No new npm dependencies.** Everything needed is installed in Phase 0.
4. **Use the shared helpers; don't reimplement them:** `requireUser`, `apiUser`, `getCurrentUser`
   (`@/lib/auth`), `db` (`@/lib/db`), tables (`@/db/schema`), types (`@/lib/types`),
   `json` and `error` (`@/lib/http`), `formatCents` and `formatDate` (`@/lib/format`),
   `StatusBadge`, `CameraCapture`, payments (`@/lib/payments`; never import `stripe` directly),
   and shadcn components from `@/components/ui/*`.
5. **No migrations or schema edits** outside Carter's lane.
6. Never commit secrets, `.env.local`, `local.db`, or `uploads/`.

## Next.js 16 specifics (your training data may predate these)

- `params` and `searchParams` are **Promises**: `const { id } = await params;`
- `cookies()` and `headers()` are **async**: `const jar = await cookies();`
- Middleware is **`proxy.ts`** exporting `proxy()`, not `middleware.ts`.
- Server Components by default; add `"use client"` only for state, effects, browser APIs or handlers.
- Tailwind CSS **v4**: no `tailwind.config.js`; just use utility classes.
- `cacheComponents` is off: no `"use cache"`, `cacheLife` or `cacheTag`.
- Type props with the global helpers: `PageProps<"/citizen/hotspots/[id]">`, `LayoutProps<"/">`.
- Route handlers: `export async function POST(req: Request) { … }`, returning `json(...)` or `error(...)`.

## Data access

- Drizzle with libSQL; **all queries are async**: `await db.select().from(hotspots).where(eq(hotspots.id, id))`.
- Import operators from `drizzle-orm`: `eq, and, desc, inArray, sql`.
- Pages read the DB directly in Server Components. Put each lane's queries in its own
  `lib/<lane>/queries.ts`. Mutations go through the API routes in CONTRACTS §6.
- Money is **integer cents**. Display it only through `formatCents`.

## UI conventions

- shadcn/ui + `lucide-react` icons + `sonner` toasts (`import { toast } from "sonner"`)
- Citizen screens are mobile-first (`max-w-md mx-auto`), since they're demoed on a phone
- Every list needs an empty state; every async button needs a loading/disabled state
- Keep it clean and civic: neutral palette, green for success and "paid", amber for pending, red for flagged

## Before you say you're done

- `npm run check:lane -- <rohan|luna>`, `npm run typecheck` and `npm run lint` all pass
- List every file you created or changed. All of them must be inside the owner's paths.
- Give a 3–5 step manual test plan using the seeded demo accounts (password `demo1234`)
