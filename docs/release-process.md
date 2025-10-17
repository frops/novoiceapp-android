# Release Process

This project combines manual semantic versioning with automated build number increments to keep EAS builds unique. Follow the checklist below whenever you prepare a release.

## 1. Update the public version

1. Decide on the next semantic version (for example, `1.1.0`).
2. Update `package.json`'s `version` field.
3. (Optional) Set the `APP_VERSION` environment variable if you need to override the version for a specific build. `app.config.ts` will prioritise the environment variable over `package.json`.

## 2. Increment build numbers

Build numbers are stored in `app/versioning.json`. They are bumped automatically in two situations:

- When you run `npm run version:bump` locally. Use this before creating a new build profile so the next commit contains the updated build numbers.
- During EAS Build via the `pre-build` hook configured in `eas.json`. The hook runs `scripts/increment-build-number.js`, which increments either the Android version code, the iOS build number, or both depending on the build platform.

If you ever need to manually adjust the counters, edit `app/versioning.json` directly (for example, to reset the iOS build number after a major release). Keep the numbers strictly increasing to satisfy the app stores.

## 3. Verify configuration

`app.config.ts` pulls the following metadata when bundling the app:

- Semantic version: `APP_VERSION` environment variable → Expo config → `package.json`
- Android version code & iOS build number: environment variables → `app/versioning.json` → total git commits

This fallback chain means builds remain unique even if the versioning file is missing, but committing `app/versioning.json` keeps local and remote builds in sync.

## 4. Tag and distribute

1. Run automated and manual tests.
2. Commit the version updates and tag the release (`git tag v1.1.0`).
3. Trigger the appropriate EAS build (`eas build --profile production`). The `pre-build` hook will increment the build number before native tooling runs.
4. Once the build succeeds, submit it to the relevant store or distribution channel.

Keeping the version fields in sync with this checklist ensures that both Expo Go and the native app stores report consistent release information.
