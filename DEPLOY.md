# Deployment Guide

Stack: **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres). All free tier.

## 1. Database — Neon

1. Sign up at https://neon.tech
2. Create a new project (region: closest to you)
3. Copy the connection string (looks like `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Run the schema against it locally:
   ```bash
   cd server
   DATABASE_URL="<your neon url>" npm run db:init
   ```

## 2. Backend — Render

1. Push this repo to GitHub.
2. Sign up at https://render.com → **New → Web Service** → connect your repo.
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Environment variables:
   - `DATABASE_URL` = your Neon URL
   - `JWT_SECRET` = a long random string (run `openssl rand -hex 32`)
   - `CLIENT_ORIGIN` = your Vercel URL (add after step 3; can start as `*`)
   - `PORT` = `4000`
5. Deploy. Note the Render URL (e.g. `https://ia-crm.onrender.com`).

> Note: Render free tier sleeps after 15 min inactivity. First request after sleep takes ~30s.

## 3. Frontend — Vercel

1. https://vercel.com → **Add New → Project** → select the repo.
2. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
3. Environment variable:
   - `VITE_API_URL` = your Render URL from step 2
4. Deploy. Note your Vercel URL.

## 4. Wire up CORS

Go back to Render → edit `CLIENT_ORIGIN` to your Vercel URL → redeploy.

## 5. Test

Visit your Vercel URL → register → create a lead → it should persist across devices.
