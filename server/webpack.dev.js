const common = require("./webpack.config.js");
const merge = require("webpack-merge");
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
            DEFAULT_ENV: 'development',
            DEFAULT_PORT: 8000,
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://localhost/3dpreviewer"),
            DEFAULT_LOGDNA_KEY: JSON.stringify("9968ae38e2a3067948d5724a2892e421"),
            DEFAULT_SENTRY_DSN: JSON.stringify("https://36059f1b619e4acf84370eab11af216e@sentry.io/1857319")
        }),
        new NodemonPlugin()
    ]
});