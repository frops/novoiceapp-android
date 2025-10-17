# Novoice Android Client

A React Native (Expo) application for Novoice that delivers an authenticated, voice-first social experience with feed playback, recording, profile management, and settings workflows.

## Project Structure

```
├── App.tsx
├── app/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── record.tsx
│       ├── profile.tsx
│       └── settings.tsx
├── app.config.ts
├── app.json
├── src/
│   ├── components/audio/Player.tsx
│   ├── screens/
│   │   ├── Auth/LoginScreen.tsx
│   │   ├── Feed/FeedScreen.tsx
│   │   ├── Record/RecordScreen.tsx
│   │   ├── Profile/ProfileScreen.tsx
│   │   └── Settings/SettingsScreen.tsx
│   ├── services/
│   │   └── mockBackend.ts
│   ├── state/
│   │   ├── feed.ts
│   │   ├── player.ts
│   │   └── session.ts
│   └── types/
│       └── models.ts
└── ...
```

Expo Router powers navigation using the files under `app/`, while shared UI and state live within `src/`.

> **Note:** Binary branding assets are intentionally excluded so this repository stays text-only. Add your own icons, splash imagery, or favicons locally under an `assets/` directory when building release binaries.

## Native project configuration

This repository tracks only the managed Expo project. The native `android/` and `ios/` directories are ignored so all platform-specific changes flow through Expo config plugins and EAS Build profiles. When a new native capability is required, add the corresponding config plugin (either from the Expo SDK or a custom plugin under `plugins/`) and ensure the change is reflected in `app.json`/`app.config.ts`. EAS Build will materialize the full native projects during CI or local builds based on these declarative settings.

## Getting Started

1. Install dependencies (requires Node.js 18+ and npm or yarn):

   ```bash
   npm install
   ```

2. Install the Expo Dev Client dependency so native modules resolve correctly:

   ```bash
   npx expo install expo-dev-client
   ```

   > **Why now?** Installing the dev client during onboarding ensures everyone moves off Expo Go before hitting APIs that require native modules.

3. Build and install a native development client for your platform (the project ships with helper scripts):

   ```bash
   npm run build:dev:android
   # or
   npm run build:dev:ios
   ```

   Follow the prompts to install the resulting binary on your emulator or device, then launch it once to register with Metro.

4. Start the Expo development server with dev-client support:

   ```bash
   npm run dev
   ```

5. Use the platform-specific shortcuts to open the dev client directly:

   ```bash
   npm run dev:android
   # or
   npm run dev:ios
   ```

   These commands bypass Expo Go entirely and attach Metro to the installed dev client. See [`docs/native-dev-builds.md`](docs/native-dev-builds.md) for end-to-end instructions, including how to produce local EAS builds when native dependencies change.

### Dependency management

- **Always install native modules with Expo's compatibility layer:** run `npx expo install <package>` instead of `npm install <package>` so the version recorded in `package.json` matches the Expo SDK 54 bundle. This keeps React Native, Expo, and unimodule APIs in sync with the managed workflow.
- After changing dependencies, run `npm run lint`, `npx tsc --noEmit`, and `npm test` to confirm the upgrade did not break the TypeScript types, lint rules, or Jest suite. Consider wiring these into a pre-commit hook (e.g., `npx simple-git-hooks`) if you update packages frequently.
- When aligning existing versions, consult `node_modules/expo/bundledNativeModules.json` or re-run `npx expo install` for each package to adopt the recommended semver range before pushing.

### Mock backend services

The client ships with an in-memory mock backend (`src/services/mockBackend.ts`) that simulates:

- Magic-link authentication and session restoration.
- Feed pagination with seeded demo posts.
- Presigned upload requests plus publishing new recordings.
- Profile updates, follow state, and optimistic like toggling.

These helpers are consumed by the Zustand stores so the entire UX works offline. When integrating with a real API, replace the functions in `mockBackend.ts` and update the stores to call your production endpoints.

## Android Emulator Setup & Testing

1. Install **Android Studio** and create a device (Android 13 or newer recommended).
2. Ensure the Android emulator is running before invoking `npm run android` or choosing the Android option in Expo CLI.
3. When the Expo bundler loads on the emulator:
   - Sign in using the Auth screen (enter a valid email and use the displayed dev code to confirm).
   - Confirm that the Feed tab populates with paginated posts.
   - Tap posts to start playback and observe progress in the global audio player.
   - Open the Record tab and long-press the record button to capture up to 60 seconds of audio, preview it, and publish to see the post appear at the top of the feed.
   - Update the profile avatar/name/bio in the Profile tab, follow/unfollow suggested creators, and verify your posts list updates when new recordings publish.
   - Use the Settings tab to open the privacy policy (external browser) and sign out.

## Audio Upload & Playback Verification

Before merging changes, validate end-to-end audio by following these steps on a device/emulator:

1. From the Record tab, long-press to create a 5–10 second clip and release to stop.
2. Preview playback inside the Record tab to confirm audio saves locally.
3. Publish the recording. The mock S3 upload helper will simulate a successful presigned upload and insert the post into the feed.
4. Navigate to the Feed tab, tap the new post, and confirm playback controls update while audio plays through the shared player component.
5. Verify the post also appears in the Profile tab under "Your voice posts".

If integrating with a real backend, replace the mock presigned upload logic in `RecordScreen` with actual API calls and repeat the verification to ensure the uploaded `audioUri` streams successfully from your storage provider.

## Scripts

- `npm run start` – Start Metro bundler via Expo.
- `npm run android` – Launch the app on an Android device/emulator.
- `npm run ios` – Launch the app on iOS simulator (requires macOS).
- `npm run web` – Start Expo for web preview.
- `npm run lint` – Run ESLint once configured.
- `npm run format` – Format source files with Prettier.
- `npm test` – Execute Jest UI tests for the core screens and flows.
- `npm run version:bump` – Increment platform-specific build numbers stored in `app/versioning.json`.
- `npx tsc --noEmit` – Type-check the project; this runs automatically in CI but is useful before pushing.

## Formatting Workflow

Code style is enforced with Prettier and ESLint:

- Run `npm run format` to apply Prettier conventions (two-space indentation, single quotes, trailing commas) across TypeScript, JavaScript, JSON, and Markdown files.
- `npm run lint` now includes `eslint-config-prettier` so Prettier formatting rules are respected during linting.
- Consider formatting staged files before committing to keep diffs clean: `npx prettier --write <path>`.

## Testing

UI coverage is implemented with Jest and React Native Testing Library. The suite focuses on the primary flows for authentication, feed consumption, recording, profile management, and settings. Run the tests locally with:

```bash
npm test
```

If you install new Expo modules that rely on native APIs, extend the mocks in `jest.setup.ts` so the components remain testable in Node.

### Runtime error recovery

Rendering errors surfaced from the navigation tree are captured by the reusable `src/components/ErrorBoundary.tsx`. The fallback UI offers **Try again** and **Reset app** actions that remount the app shell so users can recover without a full reload. Automated coverage for these flows lives in `src/components/ErrorBoundary.test.tsx`; the scenarios run alongside the regular Jest suite (`npm test`).

## Continuous Integration

GitHub Actions run for pushes and pull requests targeting `main` or `develop` to ensure code quality stays healthy:

- `.github/workflows/ci.yml` installs dependencies, runs the TypeScript compiler in no-emit mode, lints the project, and executes Jest tests.
- `.github/workflows/eas-build.yml` provisions Expo/EAS and, when branches are protected, triggers the appropriate EAS build profile (preview for `develop`, production for `main`). Manual runs are also supported via the **Run workflow** button for ad-hoc builds.

If the workflows fail locally, reproduce the checks with `npm run lint`, `npx tsc --noEmit`, and `npm test` before re-running the pipeline.

## EAS Build & Deployment

`app.config.ts` selects platform identifiers based on the `APP_VARIANT` environment variable so development, preview, and production binaries can coexist on devices. The variant also flows into the Expo manifest via `extra.appVariant` for runtime toggles.

`eas.json` defines three build profiles:

- `development` – Creates a development client with the `com.novoice.app.dev` bundle identifier for local testing.
- `preview` – Generates internal preview binaries (Android APK and iOS simulator) using the `com.novoice.app.preview` identifier for feature validation on the `develop` branch.
- `production` – Produces store-ready artifacts (Android App Bundle and iOS archive) with the `com.novoice.app` identifier that ship off the `main` branch.

Each profile sets `APP_VARIANT` so iOS bundle identifiers and Android application IDs remain unique, allowing all three builds to install side-by-side. When running `expo start`, pass `APP_VARIANT=development` (or the desired variant) to preview the corresponding configuration locally.

To install preview or production builds on devices that already have a different variant, uninstall only the matching variant (`Novoice`, `Novoice (Preview)`, or `Novoice (Dev)`). The others remain unaffected because of the distinct identifiers.

The EAS workflow authenticates using an Expo access token stored as the `EXPO_TOKEN` GitHub secret. Create this token with the minimal scopes required for EAS Build, and rotate it regularly. Any additional credentials (service accounts, signing keys, etc.) should be uploaded to Expo via `eas credentials` or referenced through encrypted GitHub Secrets—never commit them to the repository.

### Release management

Follow the step-by-step guide in [`docs/release-process.md`](docs/release-process.md) when preparing store submissions. The checklist explains how semantic versions, automated build number increments, and EAS build hooks work together so each release remains unique across Android and iOS.

## Environment Notes

- Authentication uses a mock magic-link flow with secure token persistence via `expo-secure-store`.
- Audio playback and recording use `expo-av`. Ensure microphone permissions are granted during testing.
- Global app state leverages Zustand stores (`src/state`).
