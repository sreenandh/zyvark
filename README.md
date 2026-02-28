# Zyvark - Emergency Services Platform

Full-stack emergency assistance platform with:
- NestJS backend API
- React admin web app
- Expo React Native mobile app

## Project Structure
```text
Zyvark/
|-- backend/   # NestJS API + PostgreSQL (TypeORM)
|-- admin/     # React + Vite admin/user/provider web UI
|-- mobile/    # Expo Router + NativeWind mobile app
|-- SETUP.md   # Detailed setup and troubleshooting reference
`-- README.md  # Quick start (this file)
```

## Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+
- PostgreSQL 14+
- Expo Go app on phone (must support Expo SDK 54)

## Local Setup (3 Terminals)

Run in this order:
1. Backend
2. Admin
3. Mobile

### 1) Backend (`backend`)
```bash
cd backend
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Create database in PostgreSQL:
```sql
CREATE DATABASE rescuenow;
```

Start backend:
```bash
npm run start:dev
```

Optional one-time seed:
```bash
npm run seed
```

Backend URLs:
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

### 2) Admin (`admin`)
```bash
cd admin
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Default value in `admin/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Start admin:
```bash
npm run dev
```

Admin URL:
- `http://localhost:5173`

Current web routes:
- Public: `/`, `/login`
- User: `/user/book`
- Provider: `/provider/onboarding`, `/provider/dashboard`
- Admin: `/admin/dashboard`, `/admin/providers`, `/admin/users`, `/admin/emergencies`, `/admin/disputes`, `/admin/settings`

### 3) Mobile (`mobile`, Expo SDK 54)
```bash
cd mobile
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Set your LAN IP (not localhost for physical devices):
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:3000/api
EXPO_PUBLIC_WS_URL=http://<YOUR_PC_LAN_IP>:3000
```

Start mobile:
```bash
npx expo start --go --clear
```

Notes:
- Phone and PC must be on the same Wi-Fi.
- Use Expo Go for the `--go` flow.
- If you switch to dev-client/EAS flow, Expo login is required.

## Environment Variables (At a Glance)
- `backend/.env`
  - `PORT`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`
  - `RAZORPAY_*`, `TWILIO_*`, `FIREBASE_*`
  - `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ADMIN_PHONE`, `BACKEND_URL`
- `admin/.env`
  - `VITE_API_URL`
- `mobile/.env`
  - `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`

## Common Issues and Fixes

### OTP send fails on mobile
1. Confirm backend is running on `:3000`.
2. Confirm `mobile/.env` uses your current LAN IP.
3. From phone browser open:
   - `http://<YOUR_PC_LAN_IP>:3000/api/categories`
4. If not reachable, allow firewall inbound TCP `3000`.

### Mobile opens but UI looks like plain text
Check NativeWind setup:
- `mobile/metro.config.js` exists and uses `withNativeWind(..., { input: "./global.css" })`
- `mobile/global.css` contains tailwind directives
- `mobile/app/_layout.tsx` imports `../global.css`

Then restart:
```bash
npx expo start --go --clear
```

### Expo prompts for EAS login
- For Expo Go local run, use:
  - `npx expo start --go --clear`
- Avoid key actions that switch to dev-client/EAS flow unless you intend to log in.

### "Project is incompatible with this version of Expo Go"
- Your Expo Go version and project SDK do not match.
- Current project target is Expo SDK 54.

## Security and Git Hygiene
- Do not commit `.env` files.
- Commit only `.env.example` files.
- Verify staged files before push:
```bash
git status
```

For expanded setup and troubleshooting details, see `SETUP.md` and `mobile/README_LOCAL_DEV.md`.
