# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` bootstraps navigation and shell UI, delegating to feature screens in `src/screens/`.
- Shared hooks, stores, and utilities live in `src/state/`, `src/services/`, and `src/types/`.
- Reusable UI primitives (player, buttons) sit under `src/components/`.
- Metro and Expo configuration lives in `metro.config.js`, `app.json`, and `scripts/metro-file-store-patch.js` (postinstall patcher). Keep custom scripts here, not in `src/`.
- Assets are intentionally not versioned; add local files under `assets/` when you need to test branding or audio.

## Build, Test, and Development Commands
- `npm install` — installs dependencies and runs the postinstall patch to keep Metro compatible with Expo 54.
- `npm run start` — launches the Expo dev server; use `npm run android` or `npm run ios` for platform targets.
- `npm run lint` — runs ESLint on `App.tsx` and everything in `src/`; fix findings before committing.
- When debugging Metro port allocation, re-run `node scripts/metro-file-store-patch.js` after resets to ensure the guard remains applied.

## Coding Style & Naming Conventions
- Follow the default Expo TypeScript template style: two-space indentation, single quotes, trailing commas where valid, and semicolons.
- Components use PascalCase (`FeedScreen.tsx`), hooks use `use`-prefixed camelCase (`usePlayerStore`), Zustand stores live in `src/state/<feature>.ts`.
- Prefer functional React components with explicit prop typings and keep business logic in Zustand or services.
- ESLint (`.eslintrc.js`) enforces React hooks rules and TypeScript best practices—run `npm run lint` before pushing.

## Testing Guidelines
- Automated tests are not yet configured. When adding tests, colocate them beside the implementation (`ComponentName.test.tsx`) and wire the command into `package.json`.
- Until then, validate manual flows: Expo Go launch, authentication mock, audio record/playback, and profile updates.
- Document new testing steps in `README.MD` whenever you introduce features that require regression coverage.

## Documentation
- Screen responsibilities and user flows are described in `docs/screen-spec.md`. Refer to this spec when planning or reviewing feature work.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects (e.g., `Add feed pagination store`) and group related file changes together.
- Explain context in the body when the why is not obvious; reference Linear/Jira issue IDs where relevant.
- Pull requests should outline the feature or fix, list manual test steps (especially mobile flows), and attach screenshots or screen capture gifs for UI changes.
- Make sure CI (`npm run lint`) passes before requesting review; note any Expo/Metro quirks reviewers must reproduce locally.
