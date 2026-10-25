# CivicBounty

> **Demo day (Sun Oct 25):** the app is complete and verified on `main`. **Rohan → follow
> [`docs/rohan-demo-day.md`](docs/rohan-demo-day.md).** Everyone else → [`docs/DEMO.md`](docs/DEMO.md).

Paid, verifiable community cleanup. Cities post funded **bounties** on litter hotspots, and citizens
clean them up, prove it with before/after photos and get paid through Stripe.

> **Status:** feature-complete for the 9:00 AM demo on Sun Oct 25: citizen app, government app,
> real login, in-browser camera, and Stripe sandbox funding and payouts.

## Start here

**Team members: open your AI assistant in the repo root and paste your kickoff line from
[`START_HERE.md`](START_HERE.md).** It delegates each person's work, finds your next task, and
has the assistant work on your own branch and open a PR into `main`.

| If you are… | Read |
| --- | --- |
| Anyone on the team | [`docs/ROADMAP.md`](docs/ROADMAP.md): the plan, timeline, gates, git workflow |
| Writing code | [`docs/CONTRACTS.md`](docs/CONTRACTS.md): schema, APIs, shared helpers, **who owns which files** |
| **Rohan** (Codex) | [`docs/lanes/rohan-citizen.md`](docs/lanes/rohan-citizen.md): your step-by-step runbook for the citizen app |
| **Luna** (Claude Code) | [`docs/lanes/luna-government.md`](docs/lanes/luna-government.md): your step-by-step runbook for the government app |
| Carter | [`docs/lanes/carter-foundation.md`](docs/lanes/carter-foundation.md): foundation, login, camera, Stripe, merging |
| Presenting | [`docs/DEMO.md`](docs/DEMO.md): 3-minute script, Q&A prep, morning checklist |
| An AI assistant | [`AGENTS.md`](AGENTS.md) |

### Using an LLM to build your lane

Run your assistant from the repo root. **Codex** reads `AGENTS.md` and **Claude Code** reads
`CLAUDE.md` (which loads `AGENTS.md`) automatically. Then paste the prompt for your current task
from your runbook. Every runbook task has a spec, a "Done when" list and a ready-made prompt.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 + shadcn/ui · SQLite via Drizzle
(libSQL) · bcrypt + JWT cookie auth · Stripe **sandbox** Checkout + Connect (simulated when no keys)

## Running it

```bash
nvm use                      # Node 22 (20.9+ works)
npm ci
cp .env.example .env.local   # works as-is; Stripe keys are optional
npm run db:reset             # creates local.db with demo data
npm run dev                  # http://localhost:3000
```

Demo accounts (password `demo1234`): `city@civicbounty.test` (government),
`alex@civicbounty.test` (citizen). In development, `/dev/login-as` logs you in with one click.

## Team rules in one breath

Only edit files your lane owns (`npm run check:lane -- <name>` checks it) · fixed contracts live in
`docs/CONTRACTS.md` · need a shared change? post `CONTRACT CHANGE: …` · small PRs, rebase on
`main`, Carter merges · never commit `.env.local`, `local.db` or `uploads/`.
