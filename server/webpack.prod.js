const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {from: "./files_default", to: "files_default"}
        ]),
        new webpack.DefinePlugin({
            DEFAULT_CORS_ORIGIN: /chema22r\.com$/,
            DEFAULT_ENV: 'production',
            DEFAULT_PORT: 8000,
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb+srv://3DPreviewer:64)*o.BF2W62J%5E%3ER8%7BfE%7B2@generaldefaultdb-g1vbu.mongodb.net/3dpreviewer?retryWrites=true&w=majority"),
            DEFAULT_LOGDNA_KEY: JSON.stringify("9968ae38e2a3067948d5724a2892e421"),
            DEFAULT_SENTRY_DSN: JSON.stringify("https://36059f1b619e4acf84370eab11af216e@sentry.io/1857319")
        })
    ]
});