import { ExpoConfig, ConfigContext } from '@expo/config';

type AppVariant = 'development' | 'preview' | 'production';

type VariantConfig = {
  name: string;
  androidPackage: string;
  iosBundleIdentifier: string;
};

const VARIANTS: Record<AppVariant, VariantConfig> = {
  development: {
    name: 'Novoice (Dev)',
    androidPackage: 'com.novoice.app.dev',
    iosBundleIdentifier: 'com.novoice.app.dev',
  },
  preview: {
    name: 'Novoice (Preview)',
    androidPackage: 'com.novoice.app.preview',
    iosBundleIdentifier: 'com.novoice.app.preview',
  },
  production: {
    name: 'Novoice',
    androidPackage: 'com.novoice.app',
    iosBundleIdentifier: 'com.novoice.app',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const requestedVariant = process.env.APP_VARIANT as AppVariant | undefined;
  const variant = requestedVariant && requestedVariant in VARIANTS ? requestedVariant : 'production';
  const variantConfig = VARIANTS[variant];

  return {
    name: variantConfig.name,
    slug: 'novoiceapp-android',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: variantConfig.iosBundleIdentifier,
    },
    android: {
      package: variantConfig.androidPackage,
    },
    web: {},
    plugins: ['expo-router'],
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
