'use strict';

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/**
 * Replacements that map Metro private entry points to the legacy src paths used by @expo/metro-config.
 * Metro 0.83 introduced an exports map that restricts reaching into src directly, so we rewrite the
 * imports to go through the officially supported ./private/ subpath.
 */
const patchTargets = [
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'file-store.js'),
    replacements: [
      {
        from: 'metro-cache/src/stores/FileStore',
        to: 'metro-cache/private/stores/FileStore',
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'file-store.d.ts'),
    replacements: [
      {
        from: 'metro-cache/src/stores/FileStore',
        to: 'metro-cache/private/stores/FileStore',
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'ExpoMetroConfig.js'),
    replacements: [
      {
        from: "require('metro/src/DeltaBundler/Graph')",
        to: "require('metro/private/DeltaBundler/Graph')",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'withExpoSerializers.js'),
    replacements: [
      {
        from: "require(\"metro/src/DeltaBundler/Serializers/sourceMapString\")",
        to: "require(\"metro/private/DeltaBundler/Serializers/sourceMapString\")",
      },
      {
        from: "require(\"metro/src/lib/bundleToString\")",
        to: "require(\"metro/private/lib/bundleToString\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'serializeChunks.js'),
    replacements: [
      {
        from: "require(\"metro/src/DeltaBundler/Serializers/sourceMapString\")",
        to: "require(\"metro/private/DeltaBundler/Serializers/sourceMapString\")",
      },
      {
        from: "require(\"metro/src/lib/bundleToString\")",
        to: "require(\"metro/private/lib/bundleToString\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'environmentVariableSerializerPlugin.js'),
    replacements: [
      {
        from: "require(\"metro/src/lib/CountingSet\")",
        to: "require(\"metro/private/lib/CountingSet\")",
      },
      {
        from: "require(\"metro/src/lib/countLines\")",
        to: "require(\"metro/private/lib/countLines\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'getCssDeps.js'),
    replacements: [
      {
        from: "require(\"metro/src/DeltaBundler/Serializers/helpers/js\")",
        to: "require(\"metro/private/DeltaBundler/Serializers/helpers/js\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'fork', 'baseJSBundle.js'),
    replacements: [
      {
        from: "require(\"metro/src/lib/CountingSet\")",
        to: "require(\"metro/private/lib/CountingSet\")",
      },
      {
        from: "require(\"metro/src/lib/countLines\")",
        to: "require(\"metro/private/lib/countLines\")",
      },
      {
        from: "require(\"metro/src/lib/getAppendScripts\")",
        to: "require(\"metro/private/lib/getAppendScripts\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'fork', 'js.js'),
    replacements: [
      {
        from: "require(\"metro/src/DeltaBundler/Serializers/helpers/js\")",
        to: "require(\"metro/private/DeltaBundler/Serializers/helpers/js\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'fork', 'baseJSBundle.d.ts'),
    replacements: [
      {
        from: "import CountingSet from 'metro/src/lib/CountingSet'",
        to: "import CountingSet from 'metro/private/lib/CountingSet'",
      },
      {
        from: "import countLines from 'metro/src/lib/countLines'",
        to: "import countLines from 'metro/private/lib/countLines'",
      },
      {
        from: "import type { Module } from 'metro/src/DeltaBundler'",
        to: "import type { Module } from 'metro/private/DeltaBundler'",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'serializer', 'fork', 'js.d.ts'),
    replacements: [
      {
        from: "import type { Module } from 'metro/src/DeltaBundler'",
        to: "import type { Module } from 'metro/private/DeltaBundler'",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'transform-worker.js'),
    replacements: [
      {
        from: "require(\"metro/src/lib/countLines\")",
        to: "require(\"metro/private/lib/countLines\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'metro-transform-worker.js'),
    replacements: [
      {
        from: "require(\"metro/src/ModuleGraph/worker/JsFileWrapping\")",
        to: "require(\"metro/private/ModuleGraph/worker/JsFileWrapping\")",
      },
      {
        from: "require(\"metro/src/ModuleGraph/worker/collectDependencies\")",
        to: "require(\"metro/private/ModuleGraph/worker/collectDependencies\")",
      },
      {
        from: "require(\"metro/src/ModuleGraph/worker/generateImportNames\")",
        to: "require(\"metro/private/ModuleGraph/worker/generateImportNames\")",
      },
      {
        from: "require(\"metro/src/lib/countLines\")",
        to: "require(\"metro/private/lib/countLines\")",
      },
      {
        from: "require(\"metro-transform-worker/src/utils/getMinifier\")",
        to: "require(\"metro-transform-worker/private/utils/getMinifier\")",
      },
      {
        from: "require.resolve('metro/src/ModuleGraph/worker/generateImportNames')",
        to: "require.resolve('metro/private/ModuleGraph/worker/generateImportNames')",
      },
      {
        from: "require.resolve('metro/src/ModuleGraph/worker/JsFileWrapping')",
        to: "require.resolve('metro/private/ModuleGraph/worker/JsFileWrapping')",
      },
      {
        from: "require.resolve('metro-transform-worker/src/utils/getMinifier')",
        to: "require.resolve('metro-transform-worker/private/utils/getMinifier')",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'metro-transform-worker.d.ts'),
    replacements: [
      {
        from: "import type { TransformResultDependency } from 'metro/src/DeltaBundler'",
        to: "import type { TransformResultDependency } from 'metro/private/DeltaBundler'",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'asset-transformer.js'),
    replacements: [
      {
        from: "require(\"metro/src/Bundler/util\")",
        to: "require(\"metro/private/Bundler/util\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'getAssets.js'),
    replacements: [
      {
        from: "require(\"metro/src/Assets\")",
        to: "require(\"metro/private/Assets\")",
      },
      {
        from: "require(\"metro/src/DeltaBundler/Serializers/helpers/js\")",
        to: "require(\"metro/private/DeltaBundler/Serializers/helpers/js\")",
      },
    ],
  },
  {
    file: path.join(projectRoot, 'node_modules', 'freeport-async', 'index.js'),
    replacements: [
      {
        from:
          'return freePortRangeAsync(\n            rangeSize,\n            lowPort + rangeSize,\n            options\n          ).then(fulfill, reject);',
        to:
          "const nextPort = lowPort + rangeSize;\n          if (nextPort > 65535) {\n            return reject(new Error('NO_AVAILABLE_PORT'));\n          }\n          return freePortRangeAsync(\n            rangeSize,\n            nextPort,\n            options\n          ).then(fulfill, reject);",
      },
    ],
  },
  {
    file: path.join(
      projectRoot,
      'node_modules',
      'expo',
      'node_modules',
      '@expo',
      'cli',
      'node_modules',
      'freeport-async',
      'index.js'
    ),
    replacements: [
      {
        from:
          'return freePortRangeAsync(\n            rangeSize,\n            lowPort + rangeSize,\n            options\n          ).then(fulfill, reject);',
        to:
          "const nextPort = lowPort + rangeSize;\n          if (nextPort > 65535) {\n            return reject(new Error('NO_AVAILABLE_PORT'));\n          }\n          return freePortRangeAsync(\n            rangeSize,\n            nextPort,\n            options\n          ).then(fulfill, reject);",
      },
    ],
  },
];

for (const target of patchTargets) {
  if (!fs.existsSync(target.file)) {
    console.warn(`[postinstall] Skipped missing file: ${target.file}`);
    continue;
  }

  let contents = fs.readFileSync(target.file, 'utf8');
  let changed = false;

  for (const { from, to } of target.replacements) {
    if (contents.includes(to)) {
      continue;
    }
    if (contents.includes(from)) {
      contents = contents.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(target.file, contents, 'utf8');
    console.log(`[postinstall] Patched ${target.file}`);
  }
}
