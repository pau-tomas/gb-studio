const plugins = require("./webpack.plugins");
const Path = require("path");

const srcPath = (subdir) => {
  return Path.join(__dirname, "src", subdir);
};

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
    },
  },
};
