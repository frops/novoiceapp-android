const os = require('os');

if (typeof os.availableParallelism !== 'function') {
  os.availableParallelism = () => {
    const cpus = os.cpus?.();
    return Array.isArray(cpus) && cpus.length > 0 ? cpus.length : 1;
  };
}

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
