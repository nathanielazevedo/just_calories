# Build, Deploy, and Run Instructions

## 1. Running Locally (Development)

### iOS Simulator (Expo Go or EAS Dev Build)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the Expo development server:
   ```sh
   npm start
   ```
3. Press `i` in the terminal to launch the iOS Simulator (requires Xcode), or scan the QR code with Expo Go on your device.

### Web (Development Preview)

1. Start the Expo web server:
   ```sh
   npm run web
   ```
2. Open the provided localhost URL in your browser.
   - Note: Not all features/packages may work perfectly on web.

---

## 2. Building for iOS (Preview or Production)

### Using EAS Build (Recommended)

1. Make sure you are logged in to Expo:
   ```sh
   npx expo login
   ```
2. Build for iOS preview (development/testing):
   ```sh
   eas build --profile preview --platform ios
   ```
   - This will generate a build you can install via TestFlight or direct link.

3. Build for iOS production (App Store):
   ```sh
   eas build --profile production --platform ios
   ```
   - Follow the Expo/EAS CLI instructions for credentials and submission.

4. Download the build link from the Expo dashboard or CLI output.

---

## 3. Deploying Updates (OTA/JS Only)

- To push JavaScript/asset updates to users (no native changes):
  ```sh
  eas update --branch preview
  ```
  - Users will get the update the next time they open the app.

---

## 4. Notes

- **Web builds are for development only.** This project is a React Native app and is not intended for production web deployment.
- For production iOS/Android, always use EAS Build and submit to the App Store/Play Store.
- For more info, see the [Expo Docs](https://docs.expo.dev/) and [EAS Build Docs](https://docs.expo.dev/build/introduction/).
