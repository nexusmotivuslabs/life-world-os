# Run Google Sign-In Locally

Use this when you **cannot connect / login with Google** on localhost.

## 1. Google Cloud Console (required)

Your OAuth client must allow your **local origins**. Otherwise Google blocks the sign-in.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (type **Web application**).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5002`
   - `http://localhost:5173`
   - `http://127.0.0.1:5002`
   - `http://127.0.0.1:5173`
4. Save. Changes can take a few minutes to apply.

## 2. Backend env

In **`apps/backend/.env.local`**:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Use the **same** Client ID as in the frontend (Web application client).  
`GOOGLE_CLIENT_SECRET` is optional for this flow (ID token verification only).

## 3. Frontend env

In **`apps/frontend/.env.local`**:

```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Use the **exact same** Client ID as in the backend.  
If the Google button doesn’t show, `VITE_GOOGLE_CLIENT_ID` is missing or wrong.

## 4. Restart after changing env

- **Backend:** Restart the Node process (e.g. stop and run `npm run dev` again).
- **Frontend:** Restart the Vite dev server. `VITE_*` is read only at start.

## 5. How login works in this app

- **Google Sign-In** only works for **existing** users.
- First **register** with email/password on `/register`.
- Then you can use **Google Sign-In** on `/login` with the **same email**; the app links Google to that account.

If you see “Account not found” or “Please sign up first”, create an account on `/register` (email/password), then try Google again.

## Quick checklist

- [ ] Authorized JavaScript origins in GCP include `http://localhost:5002` and `http://localhost:5173`
- [ ] `GOOGLE_CLIENT_ID` in `apps/backend/.env.local`
- [ ] `VITE_GOOGLE_CLIENT_ID` in `apps/frontend/.env.local` (same value)
- [ ] `VITE_API_URL=http://localhost:5001` in `apps/frontend/.env.local`
- [ ] Backend and frontend restarted after any env change
- [ ] User already registered (email/password) before using Google Sign-In
