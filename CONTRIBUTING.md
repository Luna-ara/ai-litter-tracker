# Contributing

Use Node 24 and npm. Clone the repo, run `npm ci`, `npm run setup`, then `npm run dev`. Keep package-lock.json committed. Do not introduce another package manager lockfile.

## Branch workflow

```sh
git switch main
git pull --ff-only
git switch -c feature/describe-your-change
```

Make changes, then run `npm run typecheck`, `npm test`, and `npm run build`. Commit only the intended files, push your branch, and open a pull request. Explain the change and how you tested it. Have a teammate review before merging; configure main-branch protection if desired.

## Where to work

- app/page.js: current demo interface
- app/api: backend routes
- lib/bounty: validation, geofence, persistence and vision helpers
- db/schema.ts: database models
- drizzle: SQL migrations
- tests/bounty-api.cjs: backend integration tests

## Database changes

Run `npm run db:generate` after schema changes, review the generated SQL, and commit the migration and metadata together. Never rewrite migrations that teammates have already applied. Run `npm run db:migrate:local` to apply new migrations. Each clone has separate local state; never commit .wrangler.

## Secrets and live services

Keep .dev.vars, .env files, API keys and personal data out of commits. The example environment is safe to commit. CI needs no secrets. Public hosting, real authentication, real camera UI integration, automatic AI verification and payments require separate integration work; do not describe the demo as implementing those services.
