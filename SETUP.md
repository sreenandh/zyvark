# RescueNow — Setup Guide

## 📁 Project Structure

```
Emergeny app/
├── backend/          → NestJS API (TypeORM + PostgreSQL)
├── mobile/           → React Native (Expo + NativeWind)
├── admin/            → React Admin Panel (Vite + Tailwind)
├── PRD.md            → Product Requirements Document
├── PROMPT.md         → Development Prompt
└── SETUP.md          → This file
```

---

## 🔧 Prerequisites

| Tool            | Version  | Install                                  |
|-----------------|----------|------------------------------------------|
| Node.js         | ≥ 18.x   | [nodejs.org](https://nodejs.org)         |
| npm             | ≥ 9.x    | Comes with Node.js                       |
| PostgreSQL      | ≥ 14.x   | [postgresql.org](https://postgresql.org) |
| Expo CLI        | Latest   | `npm install -g expo-cli`                |
| Expo Go (Phone) | Latest   | App Store / Play Store                   |

---

## 1️⃣ Backend Setup (NestJS)

### Local Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up PostgreSQL database
# Open pgAdmin or psql and create:
CREATE DATABASE rescuenow_db;

# Configure environment
# Edit .env file with your PostgreSQL credentials:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_USERNAME=postgres
#   DB_PASSWORD=your_password
#   DB_NAME=rescuenow_db

# Start the server
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`
Swagger docs at: `http://localhost:3000/api/docs`

### Seed Categories

After the server starts, call this endpoint once:
```bash
curl -X POST http://localhost:3000/api/categories/seed
```

### Key .env Variables

| Variable              | Description                    | Default         |
|-----------------------|--------------------------------|-----------------|
| `PORT`                | Server port                    | `3000`          |
| `DB_HOST`             | PostgreSQL host                | `localhost`     |
| `DB_PORT`             | PostgreSQL port                | `5432`          |
| `DB_USERNAME`         | Database username              | `postgres`      |
| `DB_PASSWORD`         | Database password              | `postgres`      |
| `DB_NAME`             | Database name                  | `rescuenow_db`  |
| `JWT_SECRET`          | JWT signing secret             | (change this!)  |
| `JWT_EXPIRES_IN`      | Token expiry                   | `7d`            |
| `RAZORPAY_KEY_ID`     | Razorpay key (for payments)    | —               |
| `RAZORPAY_KEY_SECRET` | Razorpay secret                | —               |

---

## 2️⃣ Mobile App Setup (React Native + Expo)

### Local Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Update API URL in services/api.ts
# Change API_URL to your local IP:
#   const API_URL = 'http://YOUR_LOCAL_IP:3000/api';
# Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)

# Start Expo
npx expo start
```

### Running on Device

1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code shown in terminal
3. The app will load on your device

### Running on Emulator

```bash
# Android
npx expo start --android

# iOS (Mac only)
npx expo start --ios
```

---

## 3️⃣ Admin Panel Setup (React + Vite)

### Local Setup

```bash
# Navigate to admin
cd admin

# Install dependencies
npm install

# Start dev server
npm run dev
```

Admin panel at: `http://localhost:5173`

### Build for Production

```bash
npm run build
# Output in admin/dist/
```

---

## 🚀 Live Deployment

### Backend — Railway / Render / VPS

1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables in dashboard
4. Set build command: `npm run build`
5. Set start command: `npm run start:prod`
6. Add PostgreSQL addon

### Mobile — Expo EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android

# Build iOS
eas build --platform ios
```

### Admin — Vercel / Netlify

```bash
# Vercel
npx vercel --prod

# Or Netlify
npx netlify deploy --prod --dir=dist
```

---

## 🗃️ Database Schema

Tables are auto-created by TypeORM on first run (`synchronize: true`):

- `users` — App users
- `user_addresses` — Saved addresses
- `providers` — Service providers
- `provider_skills` — Provider ↔ Category mapping
- `provider_locations` — Real-time GPS
- `categories` — Emergency types
- `emergencies` — Job requests (core table)
- `payments` — Payment records
- `reviews` — User reviews
- `disputes` — Dispute records

> ⚠️ **Production:** Set `synchronize: false` in `app.module.ts` and use TypeORM migrations.

---

## 🔑 API Endpoints Overview

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | `/api/auth/send-otp`            | Send OTP to phone              |
| POST   | `/api/auth/verify-otp`          | Verify OTP, get JWT            |
| GET    | `/api/auth/me`                  | Current user profile           |
| GET    | `/api/categories`               | List emergency types           |
| POST   | `/api/emergencies`              | Create emergency request       |
| POST   | `/api/emergencies/:id/accept`   | Provider accepts job           |
| PUT    | `/api/emergencies/:id/arrived`  | Provider arrived               |
| PUT    | `/api/emergencies/:id/completed`| Provider marks complete        |
| POST   | `/api/emergencies/:id/confirm`  | User confirms resolution       |
| POST   | `/api/uploads/image`            | Upload single image            |
| POST   | `/api/payments/create-order`    | Create Razorpay order          |
| GET    | `/api/admin/dashboard-stats`    | Admin dashboard data           |

Full Swagger docs: `http://localhost:3000/api/docs`
