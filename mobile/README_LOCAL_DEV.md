# Mobile Local Development (Expo SDK 54)

This guide is for running `mobile/` locally with backend on your machine and testing on a physical phone.

## Prerequisites
- Backend running on port `3000`
- Phone and computer on same Wi-Fi network
- Expo Go installed on phone (SDK 54 compatible)

## 1) Install dependencies
```bash
cd mobile
npm install
```

## 2) Configure environment
Copy example env:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Set your machine LAN IP in `.env`:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:3000/api
EXPO_PUBLIC_WS_URL=http://<YOUR_PC_LAN_IP>:3000
```

Find LAN IP on Windows:
```bash
ipconfig
```
Use the IPv4 address of active Wi-Fi adapter.

## 3) Start app in Expo Go mode
```bash
npx expo start --go --clear
```

Scan QR from Expo Go on phone.

## 4) Validate backend connectivity from phone
Before OTP/login tests, open this on phone browser:
```text
http://<YOUR_PC_LAN_IP>:3000/api/categories
```

If it does not load JSON:
- IP is wrong, or
- phone is on different network, or
- Windows firewall blocks port `3000`.

## 5) NativeWind styling checklist
If app opens but looks like plain text, confirm:

1. `metro.config.js` exists with NativeWind:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

2. `global.css` contains:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. `app/_layout.tsx` imports:
```ts
import "../global.css";
```

Then clear and restart:
```bash
npx expo start --go --clear
```

## 6) Expo SDK / login behavior

### Expo Go mismatch error
If you see "Project is incompatible with this version of Expo Go":
- installed Expo Go SDK and project SDK do not match.
- this project targets Expo SDK 54.

### EAS login prompt
- Expo Go flow: `npx expo start --go --clear`
- Dev-client/EAS flows require Expo account login.

## 7) Known warnings
- `SafeAreaView has been deprecated`: warning from dependency code.
- `Unable to activate keep awake`: can appear in Expo Go; often non-blocking if app continues to run.

## 8) Useful commands
```bash
# Dependency health check
npx expo-doctor

# Verify package alignment
npx expo install --check

# Start web preview
npx expo start --web
```
