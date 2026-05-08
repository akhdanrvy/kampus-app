module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset includes React Native and TypeScript support
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // NativeWind babel plugin for className support
      "nativewind/babel",
    ],
  };
};
