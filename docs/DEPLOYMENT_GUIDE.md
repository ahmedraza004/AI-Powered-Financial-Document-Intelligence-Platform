# FinDoc AI - Production Deployment Guide

This guide details deployment procedures for **Vercel**, **Docker Compose / VPS**, and **Cloud Platforms (AWS / Railway / Render)**.

---

## 1. Deploying Frontend to Vercel

The Next.js 15 frontend is 100% pre-configured for instant zero-configuration deployment on Vercel:

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In the project settings, set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed Django API URL (e.g. `https://api.yourdomain.com`).
   *(Note: If left empty, the frontend runs in rich interactive client demo mode automatically with 100% functional sample data and uploads!)*
5. Click **Deploy**.

---

## 2. Deploying Full Stack with Docker Compose (VPS / AWS EC2)

Deploy the entire stack (Postgres with pgvector, Redis, Celery, Django REST API, Nginx, Next.js) on any Ubuntu/Debian Linux VPS:

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/ahmedraza004/AI-Powered-Financial-Document-Intelligence-Platform.git
   cd AI-Powered-Financial-Document-Intelligence-Platform
   ```

2. Copy the environment configuration:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env to set your DJANGO_SECRET_KEY and OPENAI_API_KEY
   ```

3. Launch with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Verify services:
   ```bash
   docker compose ps
   ```

All services will be live:
- Frontend: `http://your-server-ip:3000` (or `http://your-domain.com` via Nginx)
- Backend REST API: `http://your-server-ip:8000/api/`
- Celery Task Worker: Processing async OCR & extraction pipelines.

---

## 3. Local Development Setup

### Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python scripts/seed_demo_data.py
python manage.py runserver
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the platform.
