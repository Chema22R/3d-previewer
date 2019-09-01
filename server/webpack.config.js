const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    target: "node",
    entry: {
        index: "./src/index.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEFAULT_PORT: 8080,
            DEFAULT_DATABASE_URI: JSON.stringify("mongodb://localhost/3dpreviewer")
        })
    ]
};