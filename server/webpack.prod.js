const common = require("./webpack.config.js");
const merge = require("webpack-merge");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map"
});