# jaks-construction

Marketing site for **Jaks Concrete Ltd.** (Vite + React + Tailwind).

```bash
npm install && npm run dev
```

```bash
npm run build
```

## Deploy on Vercel (recommended)

**Option A — GitHub (auto-deploy on push)**

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → **Import** `ronaldwopara/jaks-construction`.
2. Vercel detects **Vite**. Defaults: **Build Command** `npm run build`, **Output** `dist` (also set in `vercel.json`).
3. Click **Deploy**.

Live site: **https://jaks-landing.vercel.app** (production; future pushes to `main` redeploy automatically).

**Option B — CLI**

```bash
cd jaks-landing
npx vercel login
npx vercel        # preview
npx vercel --prod # production
```
