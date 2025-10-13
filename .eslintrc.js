module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    browser: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
};
