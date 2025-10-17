# Novoice Android Client

A React Native (Expo) application for Novoice that delivers an authenticated, voice-first social experience with feed playback, recording, profile management, and settings workflows.

## Project Structure

```
├── App.tsx
├── app.json
├── src/
│   ├── components/audio/Player.tsx
│   ├── navigation/RootNavigator.tsx
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

> **Note:** Binary branding assets are intentionally excluded so this repository stays text-only. Add your own icons, splash imagery, or favicons locally under an `assets/` directory when building release binaries.

## Getting Started

1. Install dependencies (requires Node.js 18+ and npm or yarn):

   ```bash
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npm run start
   ```

3. Choose the Android option in the Expo CLI to launch the app on a connected device or emulator.

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
- `npm test` – Execute Jest UI tests for the core screens and flows.

## Testing

UI coverage is implemented with Jest and React Native Testing Library. The suite focuses on the primary flows for authentication, feed consumption, recording, profile management, and settings. Run the tests locally with:

```bash
npm test
```

If you install new Expo modules that rely on native APIs, extend the mocks in `jest.setup.ts` so the components remain testable in Node.

### Runtime error recovery

Rendering errors surfaced from the navigation tree are captured by the reusable `src/components/ErrorBoundary.tsx`. The fallback UI offers **Try again** and **Reset app** actions that remount the app shell so users can recover without a full reload. Automated coverage for these flows lives in `src/components/ErrorBoundary.test.tsx`; the scenarios run alongside the regular Jest suite (`npm test`).

## Continuous Integration

GitHub Actions run `npm run lint` and `npm test` for pushes and pull requests targeting `main` or `develop` to ensure code quality and UI flows stay healthy. See `.github/workflows/ci.yml` for details.

## Environment Notes

- Authentication uses a mock magic-link flow with secure token persistence via `expo-secure-store`.
- Audio playback and recording use `expo-av`. Ensure microphone permissions are granted during testing.
- Global app state leverages Zustand stores (`src/state`).
