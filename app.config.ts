import type { ConfigContext, ExpoConfig } from '@expo/config';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import appJson from './app.json';
import packageJson from './package.json';

type VersionSource = 'env' | 'file' | 'git';

type VersioningState = {
  androidVersionCode: number;
  iosBuildNumber: string;
};

const VERSIONING_FILE = path.resolve(__dirname, 'app', 'versioning.json');

const runtimePolicy = (
  policy:
    | 'appVersion'
    | 'sdkVersion'
    | 'nativeVersion'
    | 'fingerprint'
    | 'fingerprintExperimental'
): ExpoConfig['runtimeVersion'] => ({ policy } as ExpoConfig['runtimeVersion']);

const normalizeRuntimeVersion = (
  value: unknown
): ExpoConfig['runtimeVersion'] => {
  if (typeof value === 'string' || typeof value === 'undefined') {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    'policy' in value &&
    typeof (value as { policy?: unknown }).policy === 'string'
  ) {
    const policy = (value as { policy: string }).policy;
    if (policy === 'fingerprintExperimental') {
      return runtimePolicy('fingerprintExperimental');
    }

    if (policy === 'fingerprint') {
      return runtimePolicy('fingerprint');
    }

    if (policy === 'appVersion') {
      return runtimePolicy('appVersion');
    }

    if (policy === 'sdkVersion') {
      return runtimePolicy('sdkVersion');
    }

    if (policy === 'nativeVersion') {
      return runtimePolicy('nativeVersion');
    }
  }

  return undefined;
};

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const readVersioningFile = (): VersioningState | null => {
  if (!fs.existsSync(VERSIONING_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(VERSIONING_FILE, 'utf8');
    const parsed = JSON.parse(content) as Partial<VersioningState>;

    if (
      parsed &&
      isPositiveInteger(parsed.androidVersionCode ?? Number.NaN) &&
      typeof parsed.iosBuildNumber === 'string' &&
      parsed.iosBuildNumber.trim().length > 0
    ) {
      return {
        androidVersionCode: parsed.androidVersionCode!,
        iosBuildNumber: parsed.iosBuildNumber!,
      };
    }
  } catch (error) {
    console.warn('Unable to parse versioning file:', error);
  }

  return null;
};

const getGitCommitCount = (): number | null => {
  try {
    const output = execSync('git rev-list --count HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    const value = Number.parseInt(output, 10);

    if (isPositiveInteger(value)) {
      return value;
    }
  } catch (error) {
    console.warn('Unable to determine git commit count for versioning:', error);
  }

  return null;
};

const resolveVersioning = (): [VersioningState, VersionSource] => {
  const envAndroid = Number.parseInt(process.env.ANDROID_VERSION_CODE ?? '', 10);
  const envIos = process.env.IOS_BUILD_NUMBER;

  if (isPositiveInteger(envAndroid) && envIos && envIos.trim()) {
    return [
      {
        androidVersionCode: envAndroid,
        iosBuildNumber: envIos,
      },
      'env',
    ];
  }

  const fileState = readVersioningFile();
  if (fileState) {
    return [fileState, 'file'];
  }

  const gitCount = getGitCommitCount();
  const fallback = gitCount ?? 1;

  return [
    {
      androidVersionCode: fallback,
      iosBuildNumber: `${fallback}`,
    },
    'git',
  ];
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig = (appJson.expo ?? {}) as Partial<ExpoConfig>;
  const {
    runtimeVersion: baseRuntimeVersion,
    orientation: baseOrientation,
    name: baseName,
    slug: baseSlug,
    ...restBaseConfig
  } = baseConfig;
  const {
    runtimeVersion: overrideRuntimeVersion,
    orientation: overrideOrientation,
    name: overrideName,
    slug: overrideSlug,
    ...restConfig
  } = config;
  const [versioning, versionSource] = resolveVersioning();

  const version =
    process.env.APP_VERSION ??
    config.version ??
    baseConfig.version ??
    packageJson.version ??
    '1.0.0';

  const runtimeVersion =
    normalizeRuntimeVersion(overrideRuntimeVersion) ??
    normalizeRuntimeVersion(baseRuntimeVersion) ??
    { policy: 'appVersion' as const };

  const orientation = overrideOrientation ?? baseOrientation;
  const name = overrideName ?? baseName ?? 'NovoiceApp';
  const slug = overrideSlug ?? baseSlug ?? 'novoiceapp-android';

  return {
    ...restBaseConfig,
    ...restConfig,
    version,
    runtimeVersion,
    orientation,
    name,
    slug,
    ios: {
      ...restBaseConfig.ios,
      ...restConfig.ios,
      buildNumber: versioning.iosBuildNumber,
    },
    android: {
      ...restBaseConfig.android,
      ...restConfig.android,
      versionCode: versioning.androidVersionCode,
    },
    extra: {
      ...restBaseConfig.extra,
      ...restConfig.extra,
      versionMetadata: {
        source: versionSource,
        version,
        androidVersionCode: versioning.androidVersionCode,
        iosBuildNumber: versioning.iosBuildNumber,
      },
    },
  };
};
