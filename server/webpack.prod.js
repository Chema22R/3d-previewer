const common = require("./webpack.config.js");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [{from: "./files_default", to: "files_default"}]
        }),
        new webpack.DefinePlugin({
            DEFAULT_CORS_ORIGIN: JSON.stringify(process.env.PREVIEWER_3D_CORS_ORIGIN),
            DEFAULT_ENV: JSON.stringify('production'),
            DEFAULT_PORT: 8000,
            DEFAULT_DATABASE_URI: JSON.stringify(process.env.PREVIEWER_3D_DATABASE_URI),
            DEFAULT_LOGDNA_KEY: JSON.stringify(process.env.PREVIEWER_3D_LOGDNA_KEY),
            DEFAULT_SENTRY_DSN: JSON.stringify(process.env.PREVIEWER_3D_SENTRY_DSN)
        })
    ]
});