# Novoice Mobile App Screen Specification

This document provides an implementation-facing specification for the current Expo/React Native application. It describes the role of each screen, the supporting state, and the primary user journeys the app supports.

## Navigation Shell
- **RootNavigator** (`src/navigation/RootNavigator.tsx`): Initializes the session store on launch. Presents either the authenticated tab shell or the unauthenticated login flow based on `session.status`.
- **Main Tab Bar**: Four tabs (`Feed`, `Record`, `Profile`, `Settings`) rendered without headers. Icons are provided by `Ionicons`.
- **Global Audio Player** (`src/components/audio/Player.tsx`): Sticky bottom sheet overlay rendered on the feed screen once a track is selected. Persistently exposes playback/seek controls and a reset action.

## Screen Responsibilities

### Auth / Login (`src/screens/Auth/LoginScreen.tsx`)
- Primary purpose: email-based authentication via mock magic links.
- Key interactions:
  - Request link: validates email, calls `session.requestMagicLink`, surfaces errors, and shows pending state.
  - Confirm login: submits 6-digit code via `session.confirmMagicLink`.
  - Displays pending email, debug code (for dev usage), and async status/errors.
- Dependencies: `useSessionStore` (Zustand) for all auth mutations and state.

### Feed (`src/screens/Feed/FeedScreen.tsx`)
- Purpose: infinite-scroll feed of community voice posts.
- Key interactions:
  - Initial fetch on mount when local cache empty (`feed.fetchNext`).
  - Pull-to-refresh (`feed.refresh`) and infinite scroll via `onEndReached`.
  - Like toggle per post with optimistic UI (`feed.toggleLike`).
  - Playback: tapping a card triggers `player.setTrack`, activating the global player overlay.
- Dependencies: `useFeedStore` for data/likes, `usePlayerStore` for playback state, `Player` component for persistent controls.

### Record (`src/screens/Record/RecordScreen.tsx`)
- Purpose: capture a new voice update up to 60 seconds and publish it.
- Key interactions:
  - Long-press capture: `Pressable` start/stop triggers, uses Expo `Audio.Recording`.
  - Duration tracking with auto-stop at `MAX_DURATION`.
  - Preview toggle via `Audio.Sound`.
  - Publish flow: uploads recording (mocked), posts to feed (`mockBackend.publishPost`), and injects the post locally with `feed.addPost`.
- Dependencies: Expo AV/FileSystem APIs, `useSessionStore` for auth check, `useFeedStore` for inserting posts.

### Profile (`src/screens/Profile/ProfileScreen.tsx`)
- Purpose: manage the signed-in user profile, discover creators, and review owned posts.
- Key interactions:
  - Avatar upload via `expo-image-picker` (requests permission).
  - Editable name/bio saved through `session.updateProfile`; synchronizes authored feed items by calling `feed.replaceUserPosts`.
  - Suggested creators list with follow/unfollow toggling (`session.toggleFollow`).
  - Lists the user’s posts via feed cache; falls back to sign-in prompt if no session.
- Dependencies: `useSessionStore`, `useFeedStore`, Expo image picker.

### Settings (`src/screens/Settings/SettingsScreen.tsx`)
- Purpose: lightweight account settings.
- Key interactions:
  - External link to privacy policy via `Linking.openURL`.
- Sign-out action clears secure token (`session.logout`) and returns to auth flow.
- Displays a truncated session token for debugging.

## Core State Stores
- **Session Store** (`src/state/session.ts`): Persisted login, status flags, follow map, and profile mutations. Persists tokens in `expo-secure-store`.
- **Feed Store** (`src/state/feed.ts`): Pagination state, post cache, optimistic like toggles, post injection and mutation helpers.
- **Player Store** (`src/state/player.ts`): Handles audio lifecycle, playback status updates, seek, and teardown.
- **Mock Backend Service** (`src/services/mockBackend.ts`): Local in-memory backend powering magic links, feed pagination, profile updates, likes, follows, uploads, and publishing.

## Primary User Journeys
- **Cold Start & Session Restore**
  1. App launches `RootNavigator`.
  2. `session.initialize` reads secure token; if valid, hydrate user and following map.
  3. Authenticated users land on `Main` tabs; unauthenticated users stay on `Login`.

- **Email Magic-Link Sign-In**
  1. Enter email on login screen; request magic link.
  2. Pending state prompts for 6-digit code (debug code shown locally).
  3. Successful confirmation stores token, transitions to authenticated tabs.

- **Feed Consumption & Playback**
  1. Feed auto-fetches first page, maintains pagination.
  2. Users can pull-to-refresh or trigger infinite scroll.
  3. Selecting a post sets it as the active track; the player overlay provides playback controls and seek.
  4. Likes update instantly with eventual backend confirmation.

- **Voice Recording & Publishing**
  1. Hold the record button to capture audio; automatic stop at 60 seconds.
  2. Preview playback available before publishing.
  3. Publish uploads audio, creates post through mock backend, and injects it into the feed list.

- **Profile Management**
  1. Edit display name or bio and save; updates session user and cached posts.
  2. Change avatar via gallery picker (permission handled inline).
  3. Follow/unfollow suggested creators to update local following state.

- **Sign-Out & Settings**
  1. Navigate to settings tab.
  2. Review privacy policy (external link) or sign out, which clears secure storage and routes back to login.

## Implementation Notes & Constraints
- Expo SDK integrations include `expo-av`, `expo-file-system`, `expo-image-picker`, and `expo-secure-store`.
- All backend interactions are mocked; replace `mockBackend` with real APIs for production.
- Audio playback and recording require runtime permissions; the app prompts on demand but does not prefetch permissions at launch.
- Player overlay persists only while `player.currentTrack` is set; invoking `reset` hides the UI.

## Future Documentation Hooks
- Extend this spec with analytics events per interaction once instrumentation exists.
- Document error-handling expectations (e.g., offline mode) when real backend endpoints are added.
- Add QA/manual test flows here when automated coverage lands.

