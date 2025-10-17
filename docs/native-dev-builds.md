# Native Dev Build Workflow

The Expo Dev Client unlocks access to custom native modules and production-like debugging without waiting for release builds. Use the steps below to keep your local environment aligned across Android and iOS.

## 1. Install the Expo Dev Client dependency

Install the matching Expo Dev Client version for this project. The `expo install` helper resolves the correct SDK-compatible release.

```bash
npx expo install expo-dev-client
```

This command updates `package.json` and `package-lock.json` (or `yarn.lock`) so everyone can share the same native client configuration.

## 2. Build a development client with EAS

Trigger a native dev client build with the dedicated **development** profile. The project includes npm scripts for convenience:

```bash
npm run build:dev:android
# or
npm run build:dev:ios
```

These scripts run `eas build --profile development --platform <platform> --local`, which produces signed debug binaries using your local toolchain. If you prefer a cloud build, remove the `--local` flag and authenticate with `eas login` first.

### Manual commands

You can also invoke the EAS CLI directly:

```bash
eas build --profile development --platform android --local
eas build --profile development --platform ios --local
```

The `development` profile in `eas.json` sets `developmentClient: true`, enabling dev build features like fast refresh with custom native modules.

## 3. Install the dev client on your device or simulator

- **Android**: Locate the generated APK under `dist/` and install it via `adb install <apk-path>` or by dragging the file onto an open emulator window.
- **iOS**: Open the generated `.app` bundle located in `dist/` with Xcode (`xcrun simctl install booted <path-to-app>`) or double-click it in Finder to launch it in the simulator.

Once installed, launching the dev client will expect a running Metro server started with the `--dev-client` flag.

## 4. Start Metro with the dev client flag

After installing the native binaries, start the development server with the new scripts:

```bash
npm run dev         # Metro only
npm run dev:android # Metro + launch on Android dev client
npm run dev:ios     # Metro + launch on iOS dev client
```

These commands enable the native dev client to connect immediately, bypassing Expo Go.

## 5. Keep Expo Go users informed (optional)

If teammates still rely on Expo Go for quick UI validation, remind them that features requiring custom native modules will only work inside the dev client build. Encourage them to transition to the dev client early in onboarding so everyone tests against the same runtime.
