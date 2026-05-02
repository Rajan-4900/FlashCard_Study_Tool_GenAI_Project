# 🚀 Study Manager Deployment Guide

This guide will walk you through the final steps to move your project from **localhost** to the **live internet**.

---

## 1. 📂 GitHub Preparation
1. Ensure your `.gitignore` is active (I have already updated this for you).
2. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare for deployment: Firebase migration & security patch"
   git push origin main
   ```

---

## 2. 🐍 Backend Deployment (Render)
1. **Create Account:** Go to [Render.com](https://render.com/).
2. **New Web Service:** Click **New +** > **Web Service**.
3. **Connect Repo:** Link your GitHub repository.
4. **Settings:**
   - **Name:** `study-manager-api`
   - **Root Directory:** `study_management_backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. **Environment Variables:** Click the **Advanced** button and add:
   - `FIREBASE_CREDENTIALS`: (Paste the entire content of your `firebase_key.json` file here).
   - `JWT_SECRET_KEY`: (Any random string for security).
   - `SECRET_KEY`: (Any random string).

---

## ⚛️ 3. Frontend Deployment (Vercel)
1. **Create Account:** Go to [Vercel.com](https://vercel.com/).
2. **Import Project:** Select your GitHub repo.
3. **Configure Project:**
   - **Framework Preset:** `Vite`.
   - **Root Directory:** `study_management_frontend`.
4. **Environment Variables:** 
   - Add `VITE_API_BASE_URL`.
   - **Value:** Your Render URL + `/api` (e.g., `https://study-manager-api.onrender.com/api`).
5. **Deploy:** Click **Deploy**.

---

## 🔗 4. Final Connection (CORS)
Once your Vercel app is live (e.g., `https://study-manager.vercel.app`):
1. Go back to your **Render** dashboard.
2. Add a new Environment Variable:
   - **Key:** `CORS_ALLOWED_ORIGINS`
   - **Value:** `https://study-manager.vercel.app` (Your Vercel link).
3. This ensures only your frontend can talk to your backend.

---

## ✅ 5. Verification
- Visit your Vercel URL.
- Try to Login/Register.
- Check the **Admin Panel** to ensure cards are being fetched correctly.

---
Built with ❤️ for the **Study Manager** team.
