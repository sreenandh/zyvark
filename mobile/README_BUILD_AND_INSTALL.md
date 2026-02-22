# How to Build and Install the App

This guide explains how to create a standalone installation of the app for your phone.

## Option 1: Development Build (Recommended for Testing)
This creates a custom version of "Expo Go" specific to your project. It allows you to debug and use custom native libraries.

**Steps:**
1.  **Install EAS CLI** (if not already installed):
    ```bash
    npm install -g eas-cli
    ```
2.  **Login to Expo**:
    ```bash
    eas login
    ```
3.  **Build for Android**:
    ```bash
    eas build --profile development --platform android
    ```
4.  **Install**:
    -   Once the build finishes, scan the QR code to install the APK on your device.
5.  **Run with Dev Client**:
    -   Start your development server:
        ```bash
        npx expo start --dev-client
        ```
    -   Open the installed app on your phone and connect to the server (it should auto-detect or you can scan the local server QR).

---

## Option 2: Preview APK (Standard Install)
This creates a standard APK file that you can install and run without a development server. It acts like the production app.

**Steps:**
1.  **Build for Android**:
    ```bash
    eas build --profile preview --platform android
    ```
2.  **Install**:
    -   Download the APK from the link provided at the end of the build.
    -   Transfer it to your phone and install it manually.

---

## Note on Windows
-   Building locally on Windows (`--local`) requires Android Studio and a fully configured environment.
-   The cloud build (default command above) is easiest as it runs on Expo's servers.

