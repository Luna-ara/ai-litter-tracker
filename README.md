# CivicBounty — team repository

Complete source export for local development with React, Vinext, Cloudflare D1 and Drizzle. Use Node.js 24 and npm. Keep the folder structure intact.

## Quick start

```sh
npm ci
npm run setup
npm run dev
```

Open the localhost URL printed in the terminal. `setup` creates `.dev.vars` from the template only if absent and applies both tracked database migrations. It is safe to repeat: applied migrations are recorded. Each teammate has their own local database. This export does not include previous users, data, keys, or uploaded images.

For API development, open `/signin-with-chatgpt?return_to=/` on that same localhost URL. Local development uses `local_seedy`; the example config grants this identity government permissions. This is local test authentication, not production authentication. `npm start` is a local built-worker preview, not a public deployment, and does not provide the Vite development sign-in helper.

## What is included

- Existing citizen and government demo UI, styling, assets and interactions.
- Hotspot and submission API routes and database schema.
- Updated citizen intake: JSON or multipart text fields, before/after image URLs or bounded JPEG data URLs, server-side GPS/geofence validation, and Pending submission persistence.
- Two database migrations, backend tests, runtime helpers, and CI workflow.

The home-page UI still uses simulated camera capture, location, verification and payments; it is not wired to the real submission API. No standalone working camera component was present in this recovered source. Submission intake does not call AI; an asynchronous verification worker and real payments are not included. The vision helper remains available for future integration. See SUBMISSION_UPDATE.md for the current API contract; it supersedes older synchronous-intake descriptions in docs/BOUNTY_BACKEND.md.

## Configuration

Edit your local `.dev.vars`. Never commit it. `BOUNTY_IMAGE_ORIGINS` is a comma-separated list of permitted HTTPS image origins. Set it before using remote evidence URLs. `GOVERNMENT_USER_IDS` controls API government roles. OpenAI settings are optional for the demo and current Pending intake; keys are deliberately absent. Configure credentials separately only when implementing real verification.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

GitHub Actions runs these on pushes and pull requests. Tests use a temporary in-memory SQLite database and mocked external services, without API keys. Build output is generated under dist and must not be committed.

## Put this project on GitHub

Extract the ZIP first. Upload the contents of this directory, not the ZIP, with package.json at the repository root. Preserve .openai/hosting.json and .github/workflows/ci.yml. Git is preferred over dragging individual files because it preserves folders and dotfiles.

For a new empty GitHub repository, run in this folder, replacing YOUR-REPO-URL:

```sh
git init
git add .
git commit -m "Add complete CivicBounty project"
git branch -M main
git remote add origin YOUR-REPO-URL
git push -u origin main
```

For an existing nonempty repository, clone it first, copy this export into a new branch, review changes and open a pull request. Do not force-push over teammates' work.

Invite your teammates through the repository's collaborator settings. They can clone the repository and follow Quick start. See CONTRIBUTING.md.

## Hosting boundary

GitHub stores source and runs checks; GitHub Pages cannot run this backend. Public hosting needs a Cloudflare-compatible runtime, a real D1 binding, migrations, environment configuration, and trusted authentication. The existing header-based authentication expects the Sites trusted ingress; do not expose it directly on another public host without replacing or securing that boundary. This export does not deploy anything or share a live database.

## Verification of this export

TypeScript, backend tests, production build, and local migrations are checked using dependencies already installed in the workspace. Fresh npm installation on an external teammate machine and public deployment have not been verified here.
