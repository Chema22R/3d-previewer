const common = require("./webpack.config.js");
const merge = require("webpack-merge");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map"
});