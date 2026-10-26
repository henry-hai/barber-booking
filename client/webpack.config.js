const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

/* Where the bundle sends its API calls. Empty means same origin, which is the
   Render deployment, where Express serves this bundle itself. The AWS deploy
   script sets it to the API Gateway URL. See src/code/config.ts. */
const apiBaseUrl = process.env.DASHBOARD_API_BASE_URL || "";

module.exports = {
  entry: "./src/code/main.tsx",
  resolve: { extensions: [".ts", ".tsx", ".js"] },
  module: {
    rules: [
      { test: /\.html$/, use: { loader: "html-loader" } },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new webpack.DefinePlugin({
      "process.env.DASHBOARD_API_BASE_URL": JSON.stringify(apiBaseUrl)
    })
  ],
  performance: { hints: false },
  devtool: "source-map"
};