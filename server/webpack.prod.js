const common = require("./webpack.config.js");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            SERVER_PORT: 8081,
            DATABASE_URL: JSON.stringify("mongodb://localhost/3dpreviewer")
        })
    ]
});