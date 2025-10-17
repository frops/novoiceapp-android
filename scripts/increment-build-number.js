#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const VERSIONING_FILE = path.resolve(__dirname, '..', 'app', 'versioning.json');

const loadVersionState = () => {
  if (!fs.existsSync(VERSIONING_FILE)) {
    return {
      androidVersionCode: 1,
      iosBuildNumber: '1',
    };
  }

  try {
    const content = fs.readFileSync(VERSIONING_FILE, 'utf8');
    const parsed = JSON.parse(content);

    return {
      androidVersionCode: Number.parseInt(parsed.androidVersionCode ?? '1', 10) || 1,
      iosBuildNumber: String(parsed.iosBuildNumber ?? '1'),
    };
  } catch (error) {
    console.warn('Unable to read current versioning state, resetting to 1:', error);
    return {
      androidVersionCode: 1,
      iosBuildNumber: '1',
    };
  }
};

const saveVersionState = (state) => {
  fs.writeFileSync(VERSIONING_FILE, `${JSON.stringify(state, null, 2)}\n`);
};

const nextValue = (current) => current + 1;

const increment = () => {
  const platformArg = process.argv.find((arg) => arg.startsWith('--platform='));
  const platformFromArg = platformArg ? platformArg.split('=')[1] : undefined;
  const platform = platformFromArg ?? process.env.EAS_BUILD_PLATFORM ?? 'all';

  const state = loadVersionState();
  const updatedState = { ...state };

  if (platform === 'android' || platform === 'all') {
    updatedState.androidVersionCode = nextValue(state.androidVersionCode);
  }

  if (platform === 'ios' || platform === 'all') {
    updatedState.iosBuildNumber = String(nextValue(Number.parseInt(state.iosBuildNumber, 10) || 0));
  }

  saveVersionState(updatedState);

  console.log('Updated build numbers:', {
    androidVersionCode: updatedState.androidVersionCode,
    iosBuildNumber: updatedState.iosBuildNumber,
    platform,
  });
};

increment();
