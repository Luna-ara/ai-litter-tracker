# CivicBounty

Paid, verifiable community cleanup. Cities post funded **bounties** on litter hotspots, and citizens
clean them up, prove it with before/after photos and get paid through Stripe.

> **Status (Sat Oct 24, 2026):** fresh start. This repo is currently just the plan. The app is being
> built tonight for a **9:00 AM demo on Sun Oct 25**. The earlier upload (an OpenAI Sites export)
> was missing its source folders and has been replaced.

## Start here

| If you are… | Read |
| --- | --- |
| Anyone on the team | [`docs/ROADMAP.md`](docs/ROADMAP.md): the plan, timeline, gates, git workflow |
| Writing code | [`docs/CONTRACTS.md`](docs/CONTRACTS.md): schema, APIs, shared helpers, **who owns which files** |
| Carter | [`docs/lanes/carter-foundation.md`](docs/lanes/carter-foundation.md): foundation, login, camera |
| Rohan | [`docs/lanes/rohan-citizen.md`](docs/lanes/rohan-citizen.md): citizen app |
| Luna | [`docs/lanes/luna-gov-payments.md`](docs/lanes/luna-gov-payments.md): government app + payments |
| Presenting | [`docs/DEMO.md`](docs/DEMO.md): 3-minute script, Q&A prep, morning checklist |
| An AI assistant | [`AGENTS.md`](AGENTS.md) |

### Using an LLM to build your lane

Give your assistant **`AGENTS.md` + `docs/CONTRACTS.md` + your lane brief**, then paste the
prompt from the bottom of your lane brief along with the task you're working on. Claude Code and
Cursor pick up `AGENTS.md`/`CLAUDE.md` automatically.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 + shadcn/ui · SQLite via Drizzle
(libSQL) · bcrypt + JWT cookie auth · Stripe (test mode) Checkout + Connect

## Running it (after Phase 0 lands)

```bash
nvm use                      # Node 22
npm ci
cp .env.example .env.local   # then fill in AUTH_SECRET (Stripe keys optional)
npm run db:reset             # creates local.db with demo data
npm run dev                  # http://localhost:3000
```

Demo accounts (password `demo1234`): `city@civicbounty.test` (government),
`alex@civicbounty.test` (citizen). In development, `/dev/login-as` logs you in with one click.

## Team rules in one breath

Only edit files your lane owns · fixed contracts live in `docs/CONTRACTS.md` · need a shared
change? post `CONTRACT CHANGE: …` · small PRs, rebase on `main`, Carter merges · never commit
`.env.local`, `local.db` or `uploads/`.
