# Deploy Life World OS to Render + Supabase

This guide prepares the app for deployment with **Supabase** (PostgreSQL) and **Render** (backend Web Service + frontend Static Site).

---

## Architecture

| Component   | Provider        | Role |
|------------|------------------|------|
| **Database** | **Supabase**    | PostgreSQL; Prisma connects via `DATABASE_URL`. |
| **Backend**  | **Render** (Web Service) | Node/Express API; runs migrations on start. |
| **Frontend** | **Render** (Static Site) | React/Vite build; `VITE_API_URL` points at backend. |

---

## Prerequisites

- GitHub (or GitLab/Bitbucket) repo with this codebase
- [Supabase](https://supabase.com) account
- [Render](https://render.com) account

---

## 1. Create Supabase database

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Set project name, DB password, and region. Save the password.
3. In the dashboard: **Settings** → **Database**.
4. Copy the **Connection string** (URI):
   - Use **Transaction** or **Session** mode.
   - For serverless (Render), the **Connection pooling** string (port **6543**) is recommended.
   - Format:  
     `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
5. Replace `[YOUR-PASSWORD]` with your database password. This is your **DATABASE_URL**.

---

## 2. Deploy backend to Render (Web Service)

1. In Render: **New** → **Web Service**.
2. Connect your repo and choose the **life-world-os** repository.
3. Configure:
   - **Name**: e.g. `life-world-os-backend`
   - **Region**: Choose closest to users.
   - **Root Directory**: `apps/backend`
   - **Runtime**: Node
   - **Build Command**:  
     `npm ci && npx prisma generate && npm run build`
   - **Start Command**:  
     `npx prisma migrate deploy && npm start`
   - **Instance Type**: Free (or paid for always-on).

4. **Environment variables** (Render dashboard → Environment):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = *(paste Supabase connection string from step 1)*
   - `JWT_SECRET` = *(min 32 characters; e.g. `openssl rand -base64 32`)*
   - `CORS_ORIGINS` = *(see step 3 – add after frontend is created)*  
     Example: `https://life-world-os-frontend.onrender.com`

5. Deploy. Note the backend URL (e.g. `https://life-world-os-backend.onrender.com`).

6. **First deploy – seed (optional):**  
   The app expects some seed data (e.g. power laws, agents). After the first successful deploy:
   - Open **Shell** for the backend service (or run locally with `DATABASE_URL` pointing at Supabase).
   - Run: `npx prisma migrate deploy && npm run seed:prod` (or `tsx src/scripts/seedWithEnv.ts prod` if you use env-based seed).  
   Or run the seed once from your machine with `DATABASE_URL` set to the Supabase URL.

---

## 3. Deploy frontend to Render (Static Site)

1. In Render: **New** → **Static Site**.
2. Connect the same repo.
3. Configure:
   - **Name**: e.g. `life-world-os-frontend`
   - **Root Directory**: `apps/frontend`
   - **Build Command**:  
     `npm ci && npm run build`
   - **Publish Directory**: `dist`

4. **Environment variables** (build-time; required for API URL):
   - `VITE_API_URL` = *(your backend URL from step 2)*  
     Example: `https://life-world-os-backend.onrender.com`  
   - No leading/trailing slash.

5. Deploy.

6. **Update backend CORS:**  
   In the backend Web Service, set:
   - `CORS_ORIGINS` = `https://life-world-os-frontend.onrender.com`  
   (Use your actual Static Site URL; add multiple origins comma-separated if needed.)

---

## 4. Verify

- **Backend health:**  
  `curl https://life-world-os-backend.onrender.com/api/health`
- **Frontend:**  
  Open the Static Site URL; log in or use the app and confirm API calls work.
- If you see CORS errors, double-check `CORS_ORIGINS` on the backend and that `VITE_API_URL` was set when the frontend was built.

---

## 5. Optional: Render Blueprint (render.yaml)

A **render.yaml** is in the repo root for Infrastructure-as-Code. You can:

- Use **New** → **Blueprint** in Render and point at the repo to create both services from the YAML, **or**
- Create the Web Service and Static Site manually as above and ignore the blueprint.

If you use the blueprint, you must still:

- Create the Supabase project and set **DATABASE_URL** and **JWT_SECRET** in the backend service (Render does not create Supabase).
- Set **VITE_API_URL** for the frontend (and **CORS_ORIGINS** for the backend) in the Render dashboard after the first deploy so the frontend URL is known.

---

## Environment reference (backend on Render)

| Variable        | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | Yes      | Supabase PostgreSQL connection string. |
| `JWT_SECRET`   | Yes      | Min 32 characters; keep secret. |
| `NODE_ENV`     | No       | Set to `production` for production. |
| `CORS_ORIGINS`| Yes (prod) | Comma-separated frontend origins (e.g. Render Static Site URL). |
| `PORT`         | No       | Set by Render automatically. |

---

## Troubleshooting

- **Backend won’t start – “Missing required environment variables”**  
  Set `DATABASE_URL` and `JWT_SECRET` in the Render backend service.

- **Backend – “Missing critical tables”**  
  Run `npx prisma migrate deploy` (included in Start Command). If migrations are missing, run `npx prisma migrate dev` once locally against Supabase, commit migrations, then redeploy.

- **Frontend – API calls fail or CORS errors**  
  1. Rebuild the frontend with `VITE_API_URL` set to the exact backend URL.  
  2. Set `CORS_ORIGINS` on the backend to the frontend origin (e.g. `https://life-world-os-frontend.onrender.com`).

- **Free tier spin-down**  
  Render free Web Services spin down after inactivity; the first request after idle may be slow. Use a paid instance for always-on.
