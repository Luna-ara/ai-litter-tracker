# START HERE: CivicBounty team handoff

**Humans:** open your AI assistant **in the repo root** and paste your kickoff line from §1.
That's it. The assistant reads this file and takes it from there.

**AI assistants:** this file is your entry point. Read all of it, then follow §3 exactly.

---

## 1. Kickoff lines (paste one into your assistant)

| Who | Tool | Paste this |
| --- | --- | --- |
| **Rohan** | Codex | `I'm Rohan. Read START_HERE.md and follow it: find my next task and do it.` |
| **Luna** | Claude Code | `I'm Luna. Read START_HERE.md and follow it: find my next task and do it.` |
| **Carter** | Claude Code | `I'm Carter. Read START_HERE.md and follow it: find my next task and do it.` |

After each task is merged (or while it waits for review), paste the same line again for the next one.

---

## 2. Who owns what

CivicBounty is a hackathon app with a **live demo on Sunday, Oct 25, 2026 at 9:00 AM**. Three
people build it in parallel. **Every file has exactly one owner, and nobody edits anyone
else's files.** That rule is how we avoid merge conflicts.

| Person | Responsibility | Runbook (tasks, specs, done-checks) | May edit ONLY these paths | Lane check |
| --- | --- | --- | --- | --- |
| **Rohan** | **Citizen app:** browse funded cleanups, check in, before/after photos, submit, see the AI score, earnings. Mobile-first; demoed on a phone. | [`docs/lanes/rohan-citizen.md`](docs/lanes/rohan-citizen.md) | `app/citizen/**`, `app/api/submissions/route.ts`, `lib/citizen/**`, `components/citizen/**`, `public/seed/**` | `npm run check:lane -- rohan` |
| **Luna** | **Government app:** dashboard, create and price hotspots, fund bounties, review queue, approve (pays the citizen) or flag. Demoed on the laptop. | [`docs/lanes/luna-government.md`](docs/lanes/luna-government.md) | `app/gov/**`, `app/api/hotspots/**`, `app/api/payments/**`, `app/api/submissions/[id]/**`, `lib/gov/**`, `components/gov/**` | `npm run check:lane -- luna` |
| **Carter** | **Foundation:** auth, camera, Stripe sandbox, shared files, docs, merging PRs, demo machine. | [`docs/lanes/carter-foundation.md`](docs/lanes/carter-foundation.md) | Everything not listed above | (owns shared files) |

The binding technical details (schema, shared helper signatures, API request and response
shapes, status rules, seed accounts) are in [`docs/CONTRACTS.md`](docs/CONTRACTS.md). The
timeline and checkpoints are in [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## 3. Instructions for the AI assistant

### 3.1 Identify your human and load context
1. The human told you their name (Rohan, Luna or Carter). If they didn't, ask before doing anything.
2. Read, in this order: `AGENTS.md` (rules and Next.js 16 specifics), `docs/CONTRACTS.md`
   (binding contracts), then **your human's runbook** from the table above.

### 3.2 Make sure the machine is set up
Run `git status` and check whether `node_modules/` and `local.db` exist. If anything is missing,
run the runbook's **"One-time setup"** section (`npm ci`, `cp .env.example .env.local` only if
`.env.local` doesn't exist yet, `npm run db:reset`). Don't ask for Stripe keys or any other
secret; the defaults work.

### 3.3 Find the next task
1. `git fetch origin && git switch main && git pull --ff-only`
2. Tasks are numbered in the runbook. A task is **done** when its work is on `main`. To check:
   - Pages and routes not yet built still contain a `TODO(<Name>)` comment and render
     `PagePlaceholder`: `grep -rn "TODO(Rohan)" app` (or `Luna`).
   - Helper files from a task (for example `lib/citizen/geo.ts`, `lib/gov/pricing.ts`) exist on `main`.
   - Open PRs count as in progress: `gh pr list --author @me` (if the `gh` CLI is available), or ask the human.
3. Pick the **lowest-numbered task that isn't done and doesn't have an open PR.** Tell the human
   which task you're starting and why, in one sentence.
4. If that task depends on one still waiting in an open PR (for example Rohan's Task 5 needs
   Task 4), branch from that PR's branch instead of `main`, and say so in the new PR's description.

### 3.4 Work on your own branch, never on `main`
```bash
git switch -c <name>/<task-number>-<short-slug>      # e.g. rohan/5-submit-flow, luna/2-dashboard
```
- **Never commit to `main` and never push to `main`.** Every change reaches `main` through a pull request.
- One task = one branch = one PR. Keep PRs small.
- Use lowercase names: `rohan/…`, `luna/…`, `carter/…`.

### 3.5 Build the task
- Implement **exactly** the task's spec from the runbook: nothing extra, nothing from other tasks.
- Only create or edit files in your human's paths (table in §2). If something outside them seems
  to need changing, **stop**, and give the human a ready-to-post message:
  `CONTRACT CHANGE: <file> - <exact change> - <why> - blocking? yes/no`
- Don't add npm dependencies, don't edit `db/schema.ts`, and don't import `stripe` directly.
- Meet the quality bar in CONTRACTS §9 (titles, empty states, loading states, error toasts, mobile layout).

### 3.6 Verify (all must pass before you commit)
```bash
npm run check:lane -- <name>     # every changed file is inside the lane
npm run typecheck
npm run lint
```
Fix anything that fails. Then walk the human through the task's **"Done when"** list in the
browser (`npm run dev`, demo logins from CONTRACTS §7, password `demo1234`).

### 3.7 Commit, push and open the pull request
```bash
git add -A
git commit -m "<Area>: <what this does> (Task <n>)"        # e.g. "Citizen: submit flow (Task 5)"
git fetch origin && git rebase origin/main               # skip if branched from another PR branch
npm run check:lane -- <name> && npm run typecheck        # re-check after the rebase
git push -u origin HEAD
```
Open a PR **into `main`**:
- With the GitHub CLI: `gh pr create --base main --fill`, then edit the body to fill in
  `.github/pull_request_template.md` (lane, checklist, how to test).
- Without `gh`: give the human the "Create a pull request" link that `git push` printed, and
  the PR title and body to paste in.

Then tell the human: "PR is open: <link>. Send it to Carter to merge." **Don't merge it
yourself**; Carter reviews and merges.

### 3.8 Then
Tell the human the next task number and title, and that pasting their kickoff line again starts it.
Don't wait for the merge unless the next task depends on this one (see 3.3 step 4).

---

## 4. Rules that are never OK to break

1. No commits or pushes to `main`. Everything goes through a PR from your own branch.
2. No edits outside your lane's paths (`npm run check:lane` must pass).
3. No new dependencies, schema changes or changes to shared signatures. Ask Carter instead.
4. No secrets in git (`.env.local`, keys), and no `local.db` or `uploads/`.
5. No force-pushing to anyone else's branch.

## 5. If something goes wrong

| Situation | What to do |
| --- | --- |
| Rebase conflict | You probably touched a file outside your lane. `git rebase --abort`, then message Carter. |
| `check:lane` fails | `git checkout origin/main -- <file>` for each listed file (delete new ones), or ask Carter for a contract change. |
| Setup or a build breaks on `main` | Message Carter with the exact command and error. Don't fix shared files yourself. |
| Strange data | `npm run db:reset` |
| Blocked on another lane | Use a local stand-in inside your own folders, note it in the PR, and keep going. |
