# Omega AI Chatbot

Production-ready React + Express chatbot.

## Backend on Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `GEMINI_API_KEY`
  - `CORS_ORIGIN=https://your-frontend.vercel.app`
  - `RATE_LIMIT_MAX=30`

## Frontend on Vercel

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_BACKEND_BASE_URL=https://your-backend.onrender.com`

After changing environment variables, redeploy the affected service.
