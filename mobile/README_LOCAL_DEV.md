# Running the Mobile App Locally

The environment has been configured to run the mobile app on your physical device.

## Prerequisites
1.  **Wi-Fi Connection:** Ensure your phone and computer are connected to the **same Wi-Fi network**.
2.  **Expo Go App:** Install "Expo Go" from the App Store (iOS) or Play Store (Android).

## Steps to Run
1.  Open a terminal in this `mobile` folder:
    ```bash
    cd "c:\Users\HP\Desktop\Emergeny app\mobile"
    ```
2.  Start the Expo development server:
    ```bash
    npx expo start --clear
    ```
    *(Note: The `node:sea` error has been fixed by upgrading to Expo SDK 54. If you see warnings, you can ignore them as long as the QR code appears.)*

3.  **Android:** Scan the QR code with the Expo Go app.
4.  **iOS:** Open the Camera app and scan the QR code.

## Troubleshooting
-   If the app cannot connect to the backend, verify your computer's IP address is still `192.168.1.5`. If it changes, update the `.env` file.
-   Ensure no firewall is blocking port `8081` (Metro Bundler) or `3000` (Backend).
