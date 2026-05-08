const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Wrap with NativeWind to enable CSS-in-JS className support
module.exports = withNativeWind(config, { input: "./global.css" });
