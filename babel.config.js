module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo"],
      ["@babel/preset-react", { runtime: "automatic" }],
      ["nativewind/babel"],
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
