/* eslint-disable @typescript-eslint/no-var-requires */
const globalPlugins = require("./webpack.plugins");
const Path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const srcPath = (subdir) => {
  return Path.join(__dirname, "src", subdir);
};

const plugins = [].concat(
  globalPlugins,
  new CopyPlugin({
    patterns: [{ from: "node_modules/vm2", to: "node_modules/vm2" }],
  })
);

module.exports = {
  target: "electron-main",
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  output: {
    hashFunction: "sha256",
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".wasm", ".css"],
    alias: {
      store: srcPath("store"),
      components: srcPath("components"),
      lib: srcPath("lib"),
      ui: srcPath("components/ui"),
      shared: srcPath("shared"),
      "package.json": Path.join(__dirname, "package.json"),
      "contributors.json": Path.join(__dirname, "contributors.json"),
    },
  },
  optimization: {
    minimize: false,
  },
  externals: {
    vm2: "vm2",
  },
};
