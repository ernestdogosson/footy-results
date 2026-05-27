# Pitchside Scores

A scoreboard for local and amateur football matches, the kind that big sports sites don't cover. Anyone can read the board. Logged-in users add fixtures and report the score they saw. For each match the app picks a **consensus** score: whichever scoreline gets reported the most.

## Live demo

`https://pitchside-scores-backend.onrender.com`

The Render service serves both the API and the built React frontend from one origin. Cold starts on the free tier can take around 30 seconds.

## File structure

```
pitchside-scores/
├── backend/
│   ├── src/                Express app, Auth0, consensus, Prisma client wrapper
│   ├── prisma/             schema.prisma + migrations
│   ├── tests/
│   └── .env.example
├── frontend/src/           React components and *.test.jsx files
├── docs/screenshots/
├── Dockerfile              multi-stage: builds the frontend, copies dist into the backend image
├── docker-compose.yml      local Postgres
└── .github/workflows/ci.yml
```

## Setup

Requires **Node 24** and **Docker** for the local Postgres.

```bash
git clone <repo-url>
cd pitchside-scores
npm install
cp backend/.env.example backend/.env       # fill in Auth0 + SESSION_SECRET
docker compose up -d
npx --workspace=backend prisma migrate dev
```

Run in two terminals:

```bash
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

App at `http://localhost:5173`. The Vite proxy forwards `/api`, `/login`, `/logout`, and `/callback` to the backend on `:3000`.

## Docker

Single multi-stage Dockerfile. Stage 1 builds the React frontend, stage 2 runs the backend and serves `frontend/dist` from the same origin. The container runs `prisma migrate deploy` at start.

```bash
docker compose up -d
docker build -t pitchside-scores .
docker run --rm \
  --network pitchside-scores_default \
  -e DATABASE_URL=postgresql://pitchside:pitchside@postgres:5432/pitchside?schema=public \
  -e AUTH_DISABLED=true \
  -p 3000:3000 \
  pitchside-scores
```

`AUTH_DISABLED=true` is the test bypass. For real local auth, supply the Auth0 and `SESSION_SECRET` values that `.env.example` lists.

## API routes

All app routes under `/api`. The Auth0 flow routes (`/login`, `/logout`, `/callback`) stay at root because `express-openid-connect` mounts them there.

| Method | Route                      | Auth      | What it does                |
| ------ | -------------------------- | --------- | --------------------------- |
| GET    | `/api/matches`             | public    | list all matches            |
| GET    | `/api/matches/:id`         | public    | one match + consensus score |
| POST   | `/api/matches`             | logged-in | add a fixture               |
| POST   | `/api/matches/:id/reports` | logged-in | report a scoreline          |
| GET    | `/api/profile`             | logged-in | the user's Auth0 profile    |
| GET    | `/health`                  | public    | liveness check              |

Anonymous calls to protected routes return JSON `401`.

## Auth

Auth0 via `express-openid-connect`. Session-cookie based, `HttpOnly`, no tokens on the client. Cookie is `SameSite=None; Secure` in production (HTTPS), plain in dev. `BASE_URL` is the URL the browser sees, so the cookie lands on the right origin.

## Data

Postgres via [Prisma](https://www.prisma.io/). `Match` table (home/away teams), `Report` table (scoreline, Auth0 `sub`, match FK with cascade delete). Locally the same migrations apply to the docker-compose Postgres on port 5433.

## Testing

```bash
docker compose up -d
npm test
```

27 tests:

- **Backend (22):** consensus unit tests, integration tests against the Express app, SPA-fallback tests for the production static-serve layer. `tests/setup.js` sets `AUTH_DISABLED=true`, truncates Match and Report before each test, and disconnects Prisma at the end.
- **Frontend (5):** React Testing Library + jsdom, `fetch` mocked.

![passing tests locally](docs/screenshots/tests-local.png)

## CI

`.github/workflows/ci.yml` runs on push and PR to `main`:

- `tests` spins up a Postgres service container, runs `prisma generate` + `migrate deploy`, then `npm test`.
- `docker-build` builds the Dockerfile end-to-end on a clean runner.

![passing pipeline](docs/screenshots/ci-pass.png)

## Security

- **No secrets committed.** `backend/.env` is gitignored; only `.env.example` ships, with the variable names.
- **Same-origin so no CORS.** One Render service serves the API and the frontend, so no `cors()` middleware is loaded and no `withCredentials` flag is needed on fetches. If the frontend were split onto a separate domain, `cors()` would need to allow that specific origin.
- **No tokens on the client.** Session cookie only, `HttpOnly` so page JS can't read it.
- **HTTPS in production.** Render terminates TLS; cookie is set with `Secure` so it never goes over plain HTTP.
- **Docker image clean.** `.dockerignore` excludes `.env`, `node_modules`, `.git`, `frontend/dist`, and the local `artifacts/` folder.
- **Auth0 callbacks use the deployed URL.** Allowed Callback and Logout URLs include the Render URL; localhost values stay for dev.
- **Test bypass scoped.** `AUTH_DISABLED=true` is set only in `tests/setup.js`.

Known gaps: no rate limiting on `POST` routes, presence-only input validation.

## Reflections

**Going single-origin instead of a split frontend and backend.** The recommended setup is Vercel for the frontend and Render for the backend on separate domains. I started there and got the Auth0 redirect working, but the session cookie set by Render was rejected by the Vercel frontend. I later read that Chrome blocks third-party cookies by default now, which is what was happening. I tried Vercel `rewrites` to proxy `/api` so the browser would see one origin; the login redirect started working but `/callback` came back as `bad request` and I couldn't trace it. Render's free-tier cold starts made every debug loop painfully slow. I dropped Vercel and had the Render service serve the built React bundle and the API together. That fixed the cookie problem, but it also collapsed two items from the security checklist: "CORS restricted to the frontend URL" and "`withCredentials` on authenticated requests" no longer apply, because there's no cross-origin surface at all. I think same-origin is strictly stricter than locked-down CORS so it's a fair trade, but on a real team I'd want to flag this and ask before going against the recommended split.

**Why Postgres at all.** A database wasn't strictly required for the assignment. I added one because Render's free tier sleeps the container after 15 minutes of inactivity, and an in-memory store would have lost every match and report on the next wake. Moving to managed Postgres made that a non-issue and didn't change the route handlers, since the existing `store.js` already hid the data layer behind a small interface.

**Docker insights.** Containerising surfaced a few things I hadn't thought about.

- `vite build` kept failing inside `node:24-alpine`. After a lot of searching I learned alpine uses musl, while the lockfile had a rollup native module pinned to glibc. I split the Dockerfile into two stages (`node:24-slim` for the frontend build, alpine for the runtime) and the build started working. Multi-stage wasn't required for an app this small, but it kept the runtime image small as a side benefit.
- I built the runtime image with `npm install --omit=dev` to keep it lean, then realised the `prisma` CLI needed to be inside the container to run `prisma migrate deploy` at start. Moving `prisma` from `devDependencies` to `dependencies` was the simplest fix.
- Running the image locally against the compose Postgres wasn't obvious. `docker run` doesn't join the compose network by default, so I had to pass `--network pitchside-scores_default` and use the service name `postgres` instead of `localhost`. A small thing that cost me an hour.

**Env vars and secrets.** The same variables live in two places: `backend/.env` (gitignored) locally, Render service env in production. Two things I'd missed at first. Render's managed Postgres gives both an Internal Database URL and an External one, and using the internal URL is much faster because the request never leaves Render's network. And for CI, I didn't actually need any secrets: the workflow boots its own Postgres service container, so the `DATABASE_URL` is hard-coded in the YAML and the production credentials never leave the dashboard.

**Auth in production.** "Make Auth0 work in production" turned out not to be one switch but three places that all need to agree on the deployed URL.

- The Auth0 application's Allowed Callback URLs and Allowed Logout URLs need the Render URL added. The localhost values stay so dev still works.
- `BASE_URL` on Render needs to be the Render URL, not the backend address. The SDK uses `BASE_URL` to build the callback target and to scope the session cookie.
- The session cookie needs `SameSite=None; Secure` in production. `SameSite=None` is what lets the browser keep the cookie across the Auth0 redirect, and `Secure` is required by browsers whenever `SameSite=None` is set, which is fine because Render is HTTPS-only.

**With one more week.** I'd add loading and error states to the match list and detail pages. The profile page has them but those two don't. I'd add rate limiting on the two `POST` routes so people can't spam reports. I'd try wiring up auto-deploy from GitHub Actions using a Render deploy hook, since right now I'm trusting Render's webhook. And I'd write at least one end-to-end test, probably Playwright, that logs in, adds a match, reports a scoreline, and checks the consensus, all against the deployed URL.
