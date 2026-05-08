# 🚀 Deploy Smart AQI to Vercel (Free)

## Overview
- **Frontend** → Vercel (free, instant deploys)
- **Backend** → Render.com (free tier)

---

## Step 1: Push to GitHub

First, push your project to a GitHub repository.

```bash
# From the workspace root
git init
git add .
git commit -m "feat: Smart AQI ready for deployment"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/smart-aqi.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render.com (Free)

1. Go to **https://render.com** → Sign up / Log in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `smart-aqi-backend`
   - **Root Directory**: `smart-aqi-health-system/backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `CORS_ORIGINS` | `https://smart-aqi.vercel.app` |
   | `DATASET_PATH` | `/app/dataset.csv` |
   | `MODELS_DIR` | `/app/models` |
   | `LOGS_DIR` | `/app/logs` |
   | `CACHE_TTL_SECONDS` | `300` |
   | `RATE_LIMIT_MAX` | `100` |
6. Click **"Create Web Service"**
7. Wait for deploy (~3-5 min). Note your URL: `https://smart-aqi-backend.onrender.com`

> ⚠️ Free Render services sleep after 15 min of inactivity. First request after sleep takes ~30s to wake up.

---

## Step 3: Deploy Frontend to Vercel (Free)

1. Go to **https://vercel.com** → Sign up / Log in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `smart-aqi-health-system/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://smart-aqi-backend.onrender.com/api/v1` |
   | `VITE_WS_URL` | `wss://smart-aqi-backend.onrender.com/ws` |
   | `VITE_APP_NAME` | `Smart AQI` |
6. Click **"Deploy"**
7. Your site will be live at: `https://smart-aqi.vercel.app` 🎉

---

## Step 4: Update CORS After Deploy

Once you have your Vercel URL, update the backend CORS on Render:

1. Go to Render dashboard → your backend service → **Environment**
2. Update `CORS_ORIGINS`:
   ```
   https://smart-aqi.vercel.app,https://smart-aqi-git-main-YOUR_USERNAME.vercel.app
   ```
3. Click **"Save Changes"** — Render will redeploy automatically

---

## Step 5: Custom Domain (Optional, Free on Vercel)

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `smartaqi.com`)
3. Follow DNS instructions from Vercel
4. SSL is automatic and free ✅

---

## 🔄 Auto-Deploy on Push

Both Vercel and Render automatically redeploy when you push to `main`:

```bash
# Make changes, then:
git add .
git commit -m "update: your change"
git push
# → Vercel rebuilds frontend automatically
# → Render rebuilds backend automatically
```

---

## 🧪 Test Your Deployment

```bash
# Test backend health
curl https://smart-aqi-backend.onrender.com/api/v1/aqi/live

# Test backend API docs
open https://smart-aqi-backend.onrender.com/docs

# Test frontend
open https://smart-aqi.vercel.app
```

**Login credentials:**
- Email: `demo@aqi.com`
- Password: `demo1234`

---

## 🐛 Common Issues

### "Network Error" on frontend
- Backend is sleeping (Render free tier) — wait 30s and retry
- Check CORS_ORIGINS includes your Vercel URL

### Build fails on Vercel
- Make sure Root Directory is set to `smart-aqi-health-system/frontend`
- Check that `VITE_API_BASE_URL` env var is set

### Backend crashes on Render
- Check logs in Render dashboard
- Dataset might be missing — ensure `dataset.csv` is committed to the repo

---

## 📊 Free Tier Limits

| Service | Limit |
|---------|-------|
| Vercel | 100GB bandwidth/month, unlimited deploys |
| Render | 750 hours/month, sleeps after 15min idle |

Both are more than enough for a portfolio/demo project.
