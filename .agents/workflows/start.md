---
description: start the expo development server
---

To start the Expo development server and the backend server concurrently, run the following command in the project root:

// turbo
``c

This will start:
1. The backend server on `server/_core/index.ts`.
2. The Metro bundler for the Expo app on port 8081.

Once the Metro bundler is running, you can:
- Scan the QR code displayed in the terminal with the **Expo Go** app (Android/iOS).
- Press **a** to open on Android emulator.
- Press **i** to open on iOS simulator.
- Press **w** to open in the web browser.