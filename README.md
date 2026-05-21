# Pitchside Scores

A score board for local and amateur football matches, the kind that big sports sites don't cover. Anyone can read the board. Logged-in users add fixtures and report the score they saw. For each match, the app picks a **consensus** score: whichever scoreline gets reported the most.

## File structure

```
pitchside-scores/
├── backend/
│   ├── src/
│   │   ├── app.js          Express app + routes
│   │   ├── auth.js         Auth0 setup
│   │   ├── consensus.js    consensus function
│   │   ├── server.js       starts the server
│   │   └── store.js        in-memory data layer
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/                React components and *.test.jsx files
│   └── package.json
├── docs/screenshots/       README images
├── .github/workflows/ci.yml
└── package.json            npm workspaces root
```

## Setup

Requires **Node 24**.

```bash
git clone <repo-url>
cd footy-results
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
# fill in Auth0 values and a random SESSION_SECRET
npm run dev
```

Frontend (second terminal):

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:5173`. The Vite proxy forwards `/api`, `/login`, `/logout`, and `/callback` to the backend.

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

## Authentication

**Auth0** with [`express-openid-connect`](https://github.com/auth0/express-openid-connect). Session-cookie based; no tokens on the client.

- `BASE_URL=http://localhost:5173` (frontend, not backend). The browser only sends cookies back to the address that set them, and it only ever sees the frontend address.
- `errorOnRequiredAuth: true` so protected routes return `401` instead of redirecting. Lets the React app show inline messages.
- `auth.js` uses default-import-then-destructure for `express-openid-connect` because the package is CommonJS and a named import fails on Node 24 ESM.

## Testing

Run all tests from the repo root:

```bash
npm test
```

23 tests total:

- **Backend** (`backend/tests/`): 18 tests. 6 unit tests on the consensus function, 12 integration tests that boot the Express app over `node:http`. The integration tests set `AUTH_DISABLED=true` in `tests/setup.js` to swap real Auth0 for a small stub that reads an `x-test-user` header.
- **Frontend** (`frontend/src/*.test.jsx`): 5 unit tests rendering components with [React Testing Library](https://testing-library.com/react). `fetch` is mocked, so no real network calls happen.

![passing tests locally](docs/screenshots/tests-local.png)

## CI

`.github/workflows/ci.yml` runs `npm test` on push and PR to `main` on a clean Ubuntu runner with Node 24.

![passing pipeline](docs/screenshots/ci-pass.png)

## Security decisions

**No secrets in the repo.** `backend/.env` is gitignored; only `.env.example` ships, with the variable names.

**Protected routes return 401.** `requiresAuth()` + `errorOnRequiredAuth: true` on the three protected routes. Covered by integration tests.

**CORS isn't opened.** No `cors()` middleware. The Vite proxy keeps everything same-origin, so the browser never makes a cross-origin request. Opening CORS would only widen the attack surface.

**No tokens in `localStorage`.** No tokens at all on the client. The only auth artifact is the session cookie, which is `HttpOnly` so page JS can't read it.

**Cookie sent with every request.** Same-origin sends cookies by default; no `credentials: 'include'` needed.

**`SESSION_SECRET`.** Signs the session cookie. Long random string in `.env`, never committed.

**Test bypass.** `AUTH_DISABLED=true` is only set in `tests/setup.js`. In production the flag is unset and Auth0 is the only way in.

**Data stored.** In-memory array. Team names, scorelines, and the Auth0 `sub` on each report. No personal info.

**Known gaps.** No rate limiting on `POST` routes. Minimal input validation. HTTPS not enforced in dev.

## Reflections

**Choices:**

- **Auth0 over Firebase.** Session-based auth fits a same-origin React app cleanly.
- **In-memory store** behind a small `store.js` interface. If a database is added later, only that one file changes.
- **Routes under `/api`.** Avoids a collision with the React client-side route `/matches/:id`.

**Challenging:**

- Matching `BASE_URL`, the Vite port, and the Auth0 callback URLs so the session cookie actually reached the browser.
- The CommonJS/ESM gotcha with `express-openid-connect`.

**Would do differently:**

- Set up GitHub Actions from the beginning.
- Add frontend unit tests earlier.
