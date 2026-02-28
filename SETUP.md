# Zyvark Local Setup Guide

This guide is the detailed reference for running backend, admin, and mobile locally.

## 1) Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+
- PostgreSQL 14+
- Android/iOS phone (same Wi-Fi as dev machine) for Expo Go testing
- Expo Go app compatible with Expo SDK 54

## 2) Repository Structure
```text
Zyvark/
|-- backend/                  # NestJS API
|-- admin/                    # Vite React web app
|-- mobile/                   # Expo Router app
|-- mobile/README_LOCAL_DEV.md
`-- SETUP.md
```

## 3) Backend Setup (`backend`)

### Install and configure
```bash
cd backend
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Create database:
```sql
CREATE DATABASE rescuenow;
```

### Start
```bash
npm run start:dev
```

URLs:
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

### Seed categories (optional, one-time)
```bash
npm run seed
```

### Important backend env variables
- `PORT=3000`
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `UPLOAD_DIR`, `MAX_FILE_SIZE`
- `ADMIN_PHONE`, `BACKEND_URL`

## 4) Admin Setup (`admin`)

### Install and configure
```bash
cd admin
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Default env:
```env
VITE_API_URL=http://localhost:3000/api
```

### Start
```bash
npm run dev
```

URL:
- `http://localhost:5173`

Current route map:
- Public: `/`, `/login`
- User: `/user/book`
- Provider: `/provider/onboarding`, `/provider/dashboard`
- Admin: `/admin/dashboard`, `/admin/providers`, `/admin/users`, `/admin/emergencies`, `/admin/disputes`, `/admin/settings`

## 5) Mobile Setup (`mobile`, Expo SDK 54)

### Install and configure
```bash
cd mobile
npm install
```

Create env file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Set LAN IP in `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:3000/api
EXPO_PUBLIC_WS_URL=http://<YOUR_PC_LAN_IP>:3000
```

Find LAN IP:
```bash
ipconfig
```

Use IPv4 from active Wi-Fi adapter (for example `192.168.31.10`).

### Start (Expo Go mode)
```bash
npx expo start --go --clear
```

Important:
- Keep phone and PC on same Wi-Fi.
- For physical device testing, do not use `localhost`.
- Expo Go path does not require EAS build.
- Dev-client/EAS path requires Expo login.

## 6) Full Local Run Order
Open 3 terminals:

1. Backend:
```bash
cd backend
npm run start:dev
```

2. Admin:
```bash
cd admin
npm run dev
```

3. Mobile:
```bash
cd mobile
npx expo start --go --clear
```

## 7) Troubleshooting

### A) OTP fails from mobile
1. Verify backend terminal is running without crash.
2. Verify `mobile/.env` IP matches current `ipconfig` IPv4.
3. From phone browser open:
   - `http://<YOUR_PC_LAN_IP>:3000/api/categories`
4. If not reachable, allow firewall inbound TCP 3000.

### B) Mobile app shows mostly text, styles missing
Check these files:
- `mobile/metro.config.js` uses `withNativeWind(config, { input: "./global.css" })`
- `mobile/global.css` has tailwind directives
- `mobile/app/_layout.tsx` imports `../global.css`

Then restart Expo:
```bash
npx expo start --go --clear
```

### C) Expo asks for EAS login unexpectedly
- Stay in Expo Go mode:
  - `npx expo start --go --clear`
- Do not switch to dev-client/EAS flow unless needed.

### D) Expo Go version mismatch error
- The installed Expo Go app and project SDK differ.
- Current project is SDK 54. Use compatible Expo Go.

### E) Safe area warning and keep-awake warning
- `SafeAreaView deprecated` is a warning from dependencies.
- `Unable to activate keep awake` is often Expo Go runtime behavior.
- If app still runs, this is usually non-blocking.

## 8) Optional: Dev Client / EAS Build Flow
Use this only when you need a custom development build.

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

Then run local server:
```bash
npx expo start --clear
```

## 9) Git Hygiene
- Keep `.env` local only.
- Commit `.env.example` files.
- Confirm before push:
```bash
git status
```
