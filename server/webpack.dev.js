const common = require("./webpack.config.js");
const dotenv = require('dotenv').config().parsed;
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const NodemonPlugin = require("nodemon-webpack-plugin");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEFAULT_CORS_ORIGIN: /localhost:8080$/,
            DEFAULT_ENV: JSON.stringify('development'),
            DEFAULT_PORT: 8000,
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://localhost/3dpreviewer"),
            DEFAULT_LOGDNA_KEY: JSON.stringify(dotenv.PREVIEWER_3D_LOGDNA_KEY),
            DEFAULT_SENTRY_DSN: JSON.stringify(dotenv.PREVIEWER_3D_SENTRY_DSN)
        }),
        new NodemonPlugin()
    ]
});