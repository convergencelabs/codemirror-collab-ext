module.exports = {
  mode: 'production',
  optimization: {
    minimize: false
  },
  entry: "./src/ts/index.ts",
  output: {
    path: __dirname + "dist/lib",
    library: "CodeMirrorCollabExt",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: "codemirror-collab-ext.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [],
  externals: {
    "codemirror": {
      amd: "CodeMirror",
      commonjs: "CodeMirror",
      commonjs2: "CodeMirror",
      root: "CodeMirror"
    }
  }
};
