# Income Academy CRM

Full-stack CRM for managing leads, follow-ups, and reimbursable expenses.

## Stack
- **Frontend**: React (Vite) — in `client/`
- **Backend**: Node.js + Express — in `server/`
- **Database**: PostgreSQL
- **Auth**: JWT-based

## Features
- User authentication (register / login)
- Lead pipeline: New Lead → Contacted → Call Booked → Closed → Lost
- Notes per lead
- Follow-up date tracking
- Lead source tracking
- Expense tracker with reimbursement status

## Local development

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally (or a remote URL)

### Setup
```bash
# Backend
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:init        # creates tables
npm run dev

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:4000.

## Deployment
- Frontend → Vercel
- Backend → Railway or Render
- Database → Railway / Neon / Supabase Postgres

See `DEPLOY.md` (to be added) once hosting provider is chosen.
