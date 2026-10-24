# CivicBounty configuration repair

## Reproduced failure

Using the uploaded tsconfig against the supplied backend produced these errors:

- app/api/hotspots/route.ts: parsed title, neighborhood, bountyAmount, and beforeImageUrl were inferred as optional and could not be inserted into the required database model.
- app/api/submissions/route.ts: completionPercentage and reason were inferred as optional and could not be passed to the submission repository.

The uploaded `strict: false` disables strict null checking. With this project's Zod 3 schemas, that changes the inferred required-field types. Restoring `strict: true` fixes the errors without weakening the database types or casting away validation.

## Changes in this download

- Restored strict TypeScript checking and excluded generated framework/database files and examples.
- Standardized the local download on npm and the supplied package-lock.json. Dependencies are unchanged; manifest and lockfile requirements match.
- Replaced the Bash-only install:ci command with npm ci, which runs on Windows too.
- Added typecheck, test, and db:migrate:local commands.
- Included the complete project source, including vite.config.ts, worker/, scripts/, app/, lib/, and database migrations. The earlier backend-only archive did not contain all files required by the package scripts.
- Added a .dev.vars.example with variable names, without any secret values.

## Run locally

Use Node.js 22.13 or newer (Node 24 LTS is suitable). Open a terminal in this extracted directory:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run db:migrate:local
npm run dev
```

Run db:migrate:local once for a fresh local database, after building. The generated SQL creates the initial tables; do not replay it against a database where this migration has already been applied.

Use the local URL printed by the dev server. This project uses Vinext to run its Next.js-compatible routes with Cloudflare D1 bindings; replacing these scripts with next dev/next start alone will not supply the cloudflare:workers runtime.

For local API authentication, visit `/signin-with-chatgpt?return_to=/` at the local preview URL. The portable development helper signs in as local_seedy. Production sign-in remains handled by Sites.

## Database and secrets

The uploaded DATABASE_URL points to a local SQLite file, but db/index.ts uses env.DB from Cloudflare Workers. DATABASE_URL is not read by this backend. Local D1 state lives under .wrangler/state and uses the DB binding declared in .openai/hosting.json. Drizzle's sqlite dialect is correct for D1; drizzle.config.ts does not itself provision a database.

To enable real image analysis, copy .dev.vars.example to .dev.vars and configure OPENAI_API_KEY, OPENAI_VISION_MODEL, GOVERNMENT_USER_IDS, and BOUNTY_IMAGE_ORIGINS. The AI model must support images and structured JSON responses. Do not put a secret in NEXT_PUBLIC_* or commit .dev.vars.

A new OpenAI key was securely saved in the assistant's working project at /workspace/sites/civicbounty-ai/.dev.vars. This download intentionally does not contain it, and saving it there does not configure your own machine or the deployed Site.

The browser UI remains a simulated demo; the backend API routes enforce the per-item bounty rule. A live client integration needs to send real before/after image URLs to /api/submissions.

## Verification scope

The uploaded configuration errors were reproduced using the existing backend source. The corrected configuration is checked with TypeScript, the backend tests, and a production build using the workspace's installed dependencies. Fresh npm installation on your machine and real AI-provider calls are not verified by those checks.

If another error remains on your machine, provide the exact terminal error and the command that produced it. Do not send .env or .dev.vars contents.
