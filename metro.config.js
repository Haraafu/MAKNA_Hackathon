const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add web-specific resolver extensions
config.resolver.platforms = ["web", "native", "ios", "android"];

// Add web support
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

module.exports = withNativeWind(config, { input: './global.css' });