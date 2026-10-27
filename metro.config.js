const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite loads its SQLite WebAssembly binary on web.
config.resolver.assetExts.push('wasm');

module.exports = config;
