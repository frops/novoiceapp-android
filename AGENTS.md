# Repository Guidelines

## Project Overview
- The repo now hosts a minimal Expo + TypeScript “Hello, world!” application.
- `App.tsx` contains the only React component and renders the greeting message.
- Configuration files (`app.json`, `package.json`, `babel.config.js`, `tsconfig.json`) follow the Expo blank template and should stay lightweight.

## Development Workflow
- `npm install` — installs dependencies defined for the basic Expo project.
- `npm start` — launches the Expo dev server; append `--android`, `--ios`, or `--web` for platform-specific launches.
- Keep changes simple; introduce new folders (e.g. `src/`) only when the app grows beyond the hello world example.

## Coding Conventions
- Follow Expo’s default TypeScript formatting: two-space indentation, single quotes, trailing commas, and semicolons.
- Prefer functional components with explicit prop typing when new UI elements are introduced.
- Keep the entry component focused; factor logic into separate modules only when needed.

## Testing & Documentation
- No automated tests are configured. Manually verify the hello world screen loads in Expo Go before sharing changes.
- Update `README.MD` alongside feature work if you expand beyond the hello world baseline.
