# Lane brief: Carter (foundation, login, camera)

> **For your LLM:** paste the prompt at the bottom of this file, along with `docs/CONTRACTS.md`
> and `AGENTS.md`. They hold everything needed to build this lane without touching anyone else's files.

## Your role

You build the ground the other two stand on, then the two "must be real" features that cut
across both sides: **login** and the **camera**. You also own every shared file, merge everyone's
PRs, and run the demo machine.

## Files you own

Everything not owned by Rohan or Luna (see CONTRACTS §2). Most importantly: `package.json`,
lockfile, `db/**`, `drizzle/**`, `scripts/**`, `proxy.ts`, `lib/{auth,db,types,http,format,utils}.ts`,
`app/{layout.tsx,globals.css,page.tsx}`, `app/{login,signup,dev}/**`, `app/api/{auth,uploads}/**`,
`components/{ui,camera}/**`, `components/{nav,status-badge}.tsx`, docs.

**Don't edit** `app/citizen/**`, `app/gov/**`, `lib/citizen/**`, `lib/gov/**`, `lib/payments.ts`,
or the submissions, hotspots and payments API routes, *even to fix a bug*. Tell the owner instead.
(Exception: after Gate 3, with the owner's OK.)

---

## Task 1: Phase 0 foundation (6:30–7:30 PM) · BLOCKS EVERYONE

Follow the checklist in ROADMAP §4. Implementation notes:

**Setup commands**
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
npm i drizzle-orm @libsql/client bcryptjs jose zod stripe sonner lucide-react
npm i -D drizzle-kit tsx @types/bcryptjs
npx shadcn@latest init        # new-york, neutral
npx shadcn@latest add button card input label textarea select badge dialog tabs table sonner avatar skeleton separator alert progress dropdown-menu
```
(`create-next-app` refuses a non-empty directory. Scaffold into a temp folder and move the files
in, keeping `docs/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.github/`.)

**`drizzle.config.ts`**
```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "turso",                       // libSQL dialect; works for local files
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:local.db" },
});
```

**`lib/db.ts`**
```ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";
const client = createClient({ url: process.env.DATABASE_URL ?? "file:local.db" });
export const db = drizzle(client, { schema });
export { schema };
```

**npm scripts**
```json
"typecheck": "tsc --noEmit",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx --env-file=.env.local scripts/seed.ts",
"db:reset": "tsx --env-file=.env.local scripts/reset-db.ts"
```
`reset-db.ts`: delete `local.db` (plus `-wal`/`-shm` files) with `fs.rmSync(..., { force: true })`,
run the migrations programmatically (`migrate` from `drizzle-orm/libsql/migrator`, `migrationsFolder: "./drizzle"`),
then call the seed function. **Don't shell out to `rm`**; teammates may be on Windows.

`seed.ts`: insert the users and hotspots from CONTRACTS §7 using `bcrypt.hashSync("demo1234", 10)`.
Give Alex `stripeAccountId: process.env.DEMO_CITIZEN_STRIPE_ACCOUNT_ID || null`. Export
`seed()` and also run it when the file is executed directly.

**Auth stub (`lib/auth.ts`, Phase 0 version)**: the `cb_session` cookie holds a raw user ID.
`getCurrentUser` looks it up in the DB. `/dev/login-as` is a page listing every user with a
button that POSTs to a small handler in `app/dev/login-as/` that sets the cookie and redirects
to `/citizen` or `/gov`. Implement `requireUser` and `apiUser` for real now, since they only
depend on `getCurrentUser`.

**`proxy.ts`** (Next 16 name for middleware)
```ts
import { NextResponse, type NextRequest } from "next/server";
export function proxy(req: NextRequest) { /* read cb_session; redirect /citizen/* and /gov/* when logged out → /login?next=... */ }
export const config = { matcher: ["/citizen/:path*", "/gov/:path*"] };
```
In the stub phase, the proxy only checks that the cookie *exists*. Page-level `requireUser(role)`
does the role check, since it has DB access.

**Uploads**: `POST /api/uploads` reads `await req.formData()`, field `file`, checks the type
(`image/jpeg|png|webp`) and size (≤ 8 MB), writes to `./uploads/<uuid>.<ext>` (create the
folder with `mkdirSync({ recursive: true })`), and returns `{ url: "/api/uploads/<file>" }`.
`GET /api/uploads/[name]` validates the name with `/^[0-9a-f-]{36}\.(jpg|png|webp)$/`, then
streams the file with the right `Content-Type`. Don't use `public/` for uploads: files added to
`public/` after `next build` aren't served.

**Camera stub**: `<CameraCapture label onCapture disabled>` renders a label, an
`<input type="file" accept="image/*" capture="environment">`, uploads on change, shows a
thumbnail, and calls `onCapture(url)`.

**Page/route stubs**: create every file in CONTRACTS §6 with placeholder content so the other
lanes only *edit* files.

**`next.config.ts`**: add `allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app"]`
so the phone tunnel works in dev.

✅ **Done when:** `npm run typecheck && npm run lint && npm run build` pass; `npm run db:reset`
works on a fresh clone; `/dev/login-as` → Alex lands on `/citizen` (stub page), and → Parks
Department lands on `/gov`; visiting `/gov` as Alex redirects away. Push to `main` and tell the team.

---

## Task 2: Real authentication (7:30–9:30 PM)

Replace the stub **without changing any exported signature**.

- `lib/auth.ts`
  - `hashPassword` / `verifyPassword` with `bcryptjs` (cost 10)
  - `createSession(user)`: `new SignJWT({ sub: user.id, role, name, email }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret)`, where `secret = new TextEncoder().encode(process.env.AUTH_SECRET)`
  - Set the cookie: `(await cookies()).set("cb_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60*60*24*7 })`
  - `getCurrentUser()`: `jwtVerify` the cookie and return a `SessionUser` from the claims (no DB hit); return `null` on any error
- `POST /api/auth/signup`: zod `{ name: min 1, email: email, password: min 8 }`, lowercase the email, `409` if it exists, always `role: "citizen"`, create the session, `201 { user }`
- `POST /api/auth/login`: generic `401 "Invalid email or password"` on any failure
- `POST /api/auth/logout`: delete the cookie
- `GET /api/auth/me`
- `proxy.ts`: verify the JWT with `jose` (it works in the proxy runtime). Logged out → `/login?next=<path>`. Wrong role (`/gov/*` as a citizen, or `/citizen/*` as government) → their own home.
- `/login`: email + password form (shadcn Card), errors through a toast, honors `?next=`, and a
  **"Demo accounts"** row of buttons that fill *and submit* Alex (citizen) and Parks Department
  (government). This saves a lot of time in the demo.
- `/signup`: name, email, password → `/citizen`
- `components/nav.tsx`: call `getCurrentUser()`; show role links, the user's name, a role badge, and Log out
- `/`: if logged in, redirect to the role's home; otherwise show the landing pitch
- Keep `/dev/login-as` working in dev (`process.env.NODE_ENV !== "production"`); have it call `createSession`

✅ **Done when:** you can sign up as a new citizen, log out, log back in; a tampered cookie means
you're logged out; a citizen hitting `/gov` is redirected; the demo buttons work in one click.

---

## Task 3: Real camera (9:30–11:00 PM)

Replace the stub inside `components/camera/camera-capture.tsx`. **Same props.**

States: `idle → requesting → live → captured → uploading → done`, plus `error`.

```ts
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
  audio: false,
});
videoRef.current.srcObject = stream;
```
- `<video autoPlay playsInline muted />`: iOS Safari needs `playsInline` + `muted`, or the preview stays black
- Shutter: draw the video frame onto a `<canvas>` scaled so the long edge is ≤ 1280 px, then
  `canvas.toBlob(cb, "image/jpeg", 0.75)`. Show the captured image with **Retake** and **Use photo** buttons.
- **Use photo**: `FormData` with `file`, `POST /api/uploads`, `onCapture(url)`, state `done`
  (show a thumbnail with a green check and a small "Retake")
- **Always stop the tracks** (`stream.getTracks().forEach(t => t.stop())`) after capture and on unmount
- **Fallback:** if `getUserMedia` is missing or throws (permission denied, insecure context),
  show the file-input version from the stub, with a short explanation. `capture="environment"`
  makes phones open the native camera.
- Layout: full width, 4:3 aspect, rounded corners, big round shutter button, works at 375 px wide
- `navigator.mediaDevices` only exists in a **secure context**: `localhost` or HTTPS. A phone hitting `http://192.168.x.x` gets the fallback.

✅ **Done when:** it works on a laptop webcam at localhost and on a phone through the HTTPS
tunnel; retake works; the uploaded URL renders; the camera light turns off after capture.

---

## Task 4: Integration (Gate 2, 11:00 PM)

- Merge all open PRs in order; resolve conflicts (there shouldn't be any outside shared files)
- `npm run db:reset`, then run the ROADMAP §7 checklist end to end. File bugs in chat to the owner.
- Make sure `npm run build && npm start` works too (more reliable for the demo than `dev`)

---

## Below the cut line (only after Gate 2)

- [ ] **Phone tunnel:** `npx cloudflared tunnel --url http://localhost:3000` (no account needed),
  then set `NEXT_PUBLIC_APP_URL` to the tunnel URL and restart. Test the camera on a phone.
- [ ] Landing page: hero with the one-line pitch, three steps (Report → Clean → Get paid), login and signup buttons
- [ ] Shared empty and loading states, favicon, app title "CivicBounty"

---

## Prompt to paste into your LLM

```
You are helping me build the "foundation" lane of CivicBounty, a Next.js 16 + SQLite (Drizzle/libSQL)
+ shadcn/ui hackathon app. Three people build in parallel and must never edit the same files.

I have attached: AGENTS.md, docs/CONTRACTS.md, docs/lanes/carter-foundation.md.
- CONTRACTS.md is the single source of truth for schema, types, exported function signatures,
  API shapes, and file ownership. Match it exactly.
- I own the shared/foundation files listed there. Do NOT create or edit anything under
  app/citizen, app/gov, lib/citizen, lib/gov, lib/payments.ts, app/api/submissions,
  app/api/hotspots, or app/api/payments, except creating the Phase 0 placeholder stubs.
- Use Next.js 16 conventions: async params/searchParams/cookies(), proxy.ts instead of
  middleware.ts, Tailwind v4 (no tailwind.config).
- Never change an exported signature from CONTRACTS.md; other people's code depends on it.

Current task: <paste the task section, e.g. "Task 2: Real authentication">.
Give me complete file contents for each file you touch, with file paths, and a short manual
test plan at the end.
```
