
/* packages
========================================================================== */

var mongoose = require("mongoose");


/* schema
========================================================================== */

var geometrySchema = new mongoose.Schema({
	name: String,
	date: {type: Date, default: Date.now},
	path: String
});

module.exports = mongoose.model("geometries", geometrySchema);