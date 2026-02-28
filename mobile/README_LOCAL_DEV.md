# Mobile Local Development

## Prerequisites
- Phone and computer on the same Wi-Fi network (for Expo Go device testing)
- Expo Go installed on the phone
- Backend running on port `3000`

## Configure `.env`
Create `mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:3000/api
EXPO_PUBLIC_WS_URL=http://<YOUR_PC_LAN_IP>:3000
```

Use `localhost` only for emulator/simulator. For physical devices, use your machine IP.

## Run

```bash
cd mobile
npm install
npx expo start --clear
```

## Troubleshooting
- If the app cannot reach backend, verify IP and same-network connectivity.
- Ensure firewall allows ports `8081` (Metro) and `3000` (backend).
- If Expo shows dependency warnings, run `npx expo install --check` in an internet-enabled environment.
