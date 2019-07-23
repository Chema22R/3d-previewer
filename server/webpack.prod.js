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
            DATABASE_URI: JSON.stringify("mongodb+srv://<username>:<password>@3dpreviewer-vbqn4.mongodb.net/3dpreviewer?retryWrites=true&w=majority")
        })
    ]
});