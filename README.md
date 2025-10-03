# Toll Fee Management System

A full-stack TypeScript project that models a congestion tax system. The backend exposes REST endpoints for calculating toll fees according to city rules, while the Next.js frontend lets drivers record and review their passages in real time.

## Key Features
- Time-of-day pricing between 8–18 SEK with rush-hour peaks
- Automatic 60-minute window rule per vehicle (highest fee within the hour applies)
- Daily fee cap of 60 SEK per vehicle
- Exemptions for specific vehicle types, weekends, and configured holidays
- In-memory storage for demo purposes with calculated totals per passage
- Bulma-styled dashboard to add, inspect, and remove toll passages

## Project Structure

```
toll-fee-system/
├── backend/    # Express + TypeScript API
├── frontend/   # Next.js + Bulma UI
├── scripts/    # workspace helpers
├── pnpm-workspace.yaml
└── package.json (workspace root)
```

---

## Workspace Setup
This repository is managed with pnpm. Install dependencies once from the project root:

```bash
pnpm install
pnpm help  # list available commands
```

---

## Running The Apps

### From the Root (recommended)
Use these commands when you want pnpm to orchestrate every package:

```bash
pnpm dev            # start backend and frontend concurrently
pnpm dev:backend    # start backend only (http://localhost:4000)
pnpm dev:frontend   # start frontend only (http://localhost:3000)
```

Build and verification:

```bash
pnpm build          # build every package
pnpm build:backend  # build backend service
pnpm build:frontend # build frontend app
pnpm test           # run all available tests
pnpm test:backend   # backend vitest suite
```

> The frontend expects `NEXT_PUBLIC_API_BASE_URL` to resolve to the backend. In development the default value is `http://localhost:4000`.

### Per Package (if you prefer working inside a folder)

```bash
# backend
cd backend
pnpm install
pnpm dev

# frontend
cd frontend
pnpm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000" > .env.local
pnpm dev
```

Once both services are running, open [http://localhost:3000](http://localhost:3000) to manage toll passages.

---

## Backend (`backend/`)

### Tech Stack
- Node.js + Express 5
- TypeScript
- Zod for input validation
- Vitest for business-rule tests

### Business Rules Implemented
- Rush-hour fees escalate to 18 SEK, quiet periods drop to 8 SEK
- When multiple passages happen within 60 minutes, only the highest fee is charged
- No charges for eligible vehicle types, weekend days, or configured holidays (2024–2025 examples included)
- Daily charge per vehicle is limited to 60 SEK, with partial fees applied as needed

---

## Frontend (`frontend/`)

### Tech Stack
- Next.js (App Router) + React 19
- TypeScript
- Bulma CSS framework

### Environment
Create `.env.local` and set the backend base URL when the frontend runs independently:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

The UI lets you:
- Add passages with vehicle details and passage time (using the backend rules on submit)
- Review each passage’s base fee, actual charged amount, and cumulative daily total
- Refresh data and delete entries to keep the log clean

---

## Testing
- Backend business logic: `pnpm test:backend`
- Frontend production check: `pnpm build:frontend`

---

## Notes & Next Steps
- Data is stored in memory for simplicity. Swap in a persistent data store for production use.
- Extend the holiday list or integrate a calendar API for more accurate regional holidays.
- Add authentication if the service is exposed to multiple users.
