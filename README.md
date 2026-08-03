# Gaming Platform - Production Deployment & Developer Guide

A production-ready full-stack gaming application built with a **NestJS + Prisma** backend and a **Vite + React + MUI** frontend.

---

## 🏗️ Architecture Overview

- **Backend**: NestJS framework, Prisma ORM, Supabase PostgreSQL, Passport JWT, Socket.io, Helmet, Rate Limiting, Health Monitoring.
- **Frontend**: Vite, React, Redux Toolkit, Tanstack React Query, MUI, Framer Motion, Socket.io Client.
- **Deployment Platform Targets**:
  - **Backend**: Render (Web Service)
  - **Frontend**: Vercel (SPA Frontend)
  - **Database**: Supabase PostgreSQL (Pooled PgBouncer connection)

---

## 📁 Repository Structure

```
gaming-site/
├── backend/                  # NestJS API Backend
│   ├── prisma/               # Prisma Schema & Migrations
│   ├── src/                  # Controllers, Modules, Services
│   ├── .env.example          # Backend Environment Template
│   ├── .gitignore
│   └── package.json
├── casino/                   # Vite React Frontend
│   ├── src/                  # UI Components, Pages, State Store
│   ├── public/               # Static Assets & Icons
│   ├── .env.example          # Frontend Environment Template
│   ├── vercel.json           # Vercel SPA Rewrites & Caching Config
│   ├── vite.config.mjs       # Code Splitting & Build Configuration
│   └── package.json
├── .env.example              # Environment Quick Reference
├── .gitignore                # Global Secret & Artifact Exclusion Rules
├── render.yaml               # Render Infrastructure Blueprint
├── vercel.json               # Root Vercel Monorepo Config
└── README.md                 # Complete Deployment Documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local or Supabase database credentials
npx prisma generate
npx prisma db push
npm run start:dev
```

Backend will run on: `http://localhost:3000` (Health check: `http://localhost:3000/health`).

### 2. Frontend Setup

```bash
cd casino
npm install
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL=http://localhost:3000
npm run start
```

Frontend will run on: `http://localhost:5173`.

---

## 📤 Preparing for GitHub

1. Ensure sensitive secrets (`.env`) are excluded (verified in `.gitignore`).
2. Initialize repository if needed:
   ```bash
   git init
   git add .
   git commit -m "feat: production deployment setup for Render and Vercel"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.NET.git
   git push -u origin main
   ```

---

## 🌐 Production Deployment Guide

### 1. Backend Deployment on Render

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprints** (or **Web Service**).
3. Connect your GitHub repository.
4. Render will detect `render.yaml` automatically. Alternatively, create a Web Service manually:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Health Check Path**: `/health`
5. Configure Environment Variables in Render:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<Your Supabase Pooled Connection String (port 6543)>`
   - `DIRECT_URL` = `<Your Supabase Direct Connection String (port 5432)>`
   - `JWT_SECRET` = `<Generated Strong Secret Key>`
   - `JWT_REFRESH_SECRET` = `<Generated Strong Secret Key>`
   - `FRONTEND_URL` = `https://your-frontend-app.vercel.app`
6. Deploy! Copy your deployed Render backend URL (e.g., `https://gaming-backend.onrender.com`).

---

### 2. Frontend Deployment on Vercel

1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `casino`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL` = `https://gaming-backend.onrender.com`
   - `VITE_SOCKET_URL` = `https://gaming-backend.onrender.com`
   - `VITE_APP_NAME` = `87 Casino`
6. Click **Deploy**.

---

## 🔍 Verification & Health Monitoring

- **Health Check API**: `GET https://gaming-backend.onrender.com/health`
  ```json
  {
    "status": "ok",
    "uptime": 245.12,
    "version": "1.0.0",
    "timestamp": "2026-07-30T17:25:00.000Z"
  }
  ```
- **API Swagger Documentation**: Disabled in production by default (Set `ENABLE_SWAGGER=true` to enable at `/api/docs`).

---

## 🛡️ Security Best Practices Enforced

- **Helmet Header Protections** enabled.
- **CORS Restricted** to configured frontend domain and Vercel previews (`*.vercel.app`).
- **Secrets Hidden**: All API keys, database credentials, and JWT keys stored exclusively in environment variables.
- **Rate Limiting**: NestJS Throttler guards endpoints from abuse.
