
/* packages
========================================================================== */

var express = require("express");
var router = express.Router();
var app = express();

var cors = require("cors");
var mongoose = require("mongoose");


/* controllers
========================================================================== */

var api = require("./controllers/api.js");


/* app configuration
========================================================================== */

app.use(cors());
app.use("/api", router);


/* connections
========================================================================== */

app.listen(8080, function () {
	console.log("> Node server running on http://localhost:8080");
});

mongoose.connect("mongodb://localhost/3dpreview", function(err, res) {
	if (err) {
		console.error("- ERROR connecting to database\n     " + err.message);
	} else {
		console.log("> Connected to database");
	}
});


/* API
========================================================================== */

router.route("/file")
	.get(api.getAll)
	.post(api.upload);

router.route("/file/:id")
	.get(api.getById)
	.delete(api.deleteById);