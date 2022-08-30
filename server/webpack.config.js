const path = require("path");

module.exports = {
    target: "node",
    entry: {
        index: "./src/index.js"
    },
    output: {
        clean: true,
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    }
};