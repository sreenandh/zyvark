# 🚨 RescueNow — Emergency Services Platform

A full-stack emergency services platform with real-time provider matching, live tracking, and escrow payments.

---

## 📁 Project Structure

```
RescueNow/
├── backend/      →  NestJS REST API + WebSocket (TypeORM, PostgreSQL)
├── mobile/       →  React Native mobile app (Expo, NativeWind)
├── admin/        →  React admin dashboard (Vite, Tailwind CSS)
├── SETUP.md      →  Detailed setup reference
└── README.md     →  This file
```

---

## ⚡ Quick Start (Local)

### Prerequisites

| Tool         | Version | Install                           |
|--------------|---------|-----------------------------------|
| Node.js      | ≥ 18    | https://nodejs.org                |
| PostgreSQL   | ≥ 14    | https://postgresql.org            |
| Expo Go      | Latest  | App Store / Play Store            |

---

### 1. Backend API

```bash
cd backend
npm install
```

**Configure environment:** Copy `.env.example` → `.env` and fill in your values:

```
# .env (key variables)
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:19006

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=rescuenow

JWT_SECRET=change_this_to_a_random_string
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_secret

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**Create database:**

```sql
CREATE DATABASE rescuenow;
```

**Start:**

```bash
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`

**Seed categories (run once):**

```bash
curl -X POST http://localhost:3000/api/categories/seed
```

---

### 2. Mobile App

```bash
cd mobile
npm install
```

**Configure environment:** Copy `.env.example` → `.env`:

```
# .env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api
EXPO_PUBLIC_WS_URL=http://YOUR_LOCAL_IP:3000
```

> **⚠️ Important:** For device testing, use your machine's local IP (run `ipconfig` on Windows or `ifconfig` on Mac/Linux), NOT `localhost`.

**Start:**

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

### 3. Admin Panel

```bash
cd admin
npm install
```

**Configure environment:** Copy `.env.example` → `.env`:

```
# .env
VITE_API_URL=http://localhost:3000/api
```

**Start:**

```bash
npm run dev
```

Admin panel: `http://localhost:5173`

---

## 🌐 Environment Variables Summary

All URLs are configured via environment variables — **no hardcoded URLs** in the codebase.

| App      | File   | Variable              | Purpose                    |
|----------|--------|-----------------------|----------------------------|
| Backend  | `.env` | `PORT`                | Server port                |
| Backend  | `.env` | `CORS_ORIGINS`        | Allowed CORS origins (CSV) |
| Backend  | `.env` | `DB_*`                | PostgreSQL connection      |
| Backend  | `.env` | `JWT_SECRET`          | Token signing key          |
| Backend  | `.env` | `RAZORPAY_*`          | Payment gateway keys       |
| Backend  | `.env` | `TWILIO_*`            | SMS OTP service            |
| Backend  | `.env` | `FIREBASE_*`          | Push notification service  |
| Mobile   | `.env` | `EXPO_PUBLIC_API_URL` | Backend API endpoint       |
| Mobile   | `.env` | `EXPO_PUBLIC_WS_URL`  | WebSocket endpoint         |
| Admin    | `.env` | `VITE_API_URL`        | Backend API endpoint       |

---

## 🚀 Live Deployment

### Backend → Railway / Render / VPS

1. Push to GitHub
2. Connect repo to Railway or Render
3. Set all env variables from `.env.example`
4. Set build: `npm run build` → start: `npm run start:prod`
5. Add PostgreSQL addon
6. Update `CORS_ORIGINS` to your live admin/mobile URLs

### Mobile → Expo EAS Build

```bash
npm install -g eas-cli
eas login
eas build --platform android   # APK/AAB
eas build --platform ios       # IPA
```

Update `EXPO_PUBLIC_API_URL` in `.env` to your live backend URL before building.

### Admin → Vercel / Netlify

```bash
# Build for production
npm run build

# Deploy
npx vercel --prod
# OR
npx netlify deploy --prod --dir=dist
```

Set `VITE_API_URL` to your live backend URL in the hosting platform's env settings.

---

## 🗃️ Database Tables

Auto-created by TypeORM on first run (`synchronize: true`):

| Table                | Purpose                 |
|----------------------|-------------------------|
| `users`              | App users               |
| `user_addresses`     | Saved addresses         |
| `providers`          | Service providers       |
| `provider_skills`    | Provider ↔ Category     |
| `provider_locations` | Real-time GPS           |
| `categories`         | Emergency types         |
| `emergencies`        | Job lifecycle (core)    |
| `payments`           | Payment records         |
| `reviews`            | User reviews            |
| `disputes`           | Dispute records         |

> **Production:** Set `synchronize: false` in `app.module.ts` and use TypeORM migrations.

---

## 🔑 API Endpoints

| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| POST   | `/api/auth/send-otp`              | No   | Send OTP to phone        |
| POST   | `/api/auth/verify-otp`            | No   | Verify OTP → JWT token   |
| GET    | `/api/auth/me`                    | Yes  | Current user profile     |
| GET    | `/api/categories`                 | No   | List emergency types     |
| POST   | `/api/emergencies`                | Yes  | Create emergency         |
| POST   | `/api/emergencies/:id/accept`     | Yes  | Provider accepts         |
| PUT    | `/api/emergencies/:id/arrived`    | Yes  | Provider arrived         |
| PUT    | `/api/emergencies/:id/completed`  | Yes  | Provider done            |
| POST   | `/api/emergencies/:id/confirm`    | Yes  | User confirms            |
| POST   | `/api/uploads/image`              | Yes  | Upload image             |
| POST   | `/api/payments/create-order`      | Yes  | Create Razorpay order    |
| GET    | `/api/admin/dashboard-stats`      | Admin| Dashboard statistics     |

Full interactive docs → `http://localhost:3000/api/docs`

---

## 🛠️ Tech Stack

| Layer      | Technology                                     |
|------------|-------------------------------------------------|
| Backend    | NestJS, TypeORM, PostgreSQL, Socket.IO          |
| Mobile     | React Native, Expo, NativeWind, Zustand         |
| Admin      | React, Vite, Tailwind CSS, React Query          |
| Auth       | JWT + OTP (Passport.js)                         |
| Uploads    | Multer + Sharp (WebP compression)               |
| Payments   | Razorpay (escrow model)                         |
| Real-time  | Socket.IO WebSocket gateway                     |
| SMS        | Twilio (stub ready)                             |
| Push       | Firebase Cloud Messaging (stub ready)           |
