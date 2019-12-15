"use strict";

/* packages
========================================================================== */

var express = require("express");
var app = express();

var cors = require("cors");
var bodyParser = require("body-parser");
var Logger = require('logdna');
var Sentry = require('@sentry/node');
var fs = require("fs");
var mongoose = require("mongoose");


/* sentry
========================================================================== */

Sentry.init({ dsn: process.env.SENTRY_DSN || DEFAULT_SENTRY_DSN });
app.use(Sentry.Handlers.requestHandler());


/* controllers
========================================================================== */

var api = require("./app/api.js");
var databaseInit = require("./app/databaseInit.js");


/* cors configuration
========================================================================== */

var corsOpts = {
	origin: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN
};
app.options("/file/:id", cors(corsOpts));	// enable pre-flight request


/* app configuration
========================================================================== */

app.use(bodyParser.json());


/* log and files
========================================================================== */

app.locals.logger = Logger.createLogger(process.env.LOGDNA_KEY || DEFAULT_LOGDNA_KEY, {
    app: "3D Previewer",
    env: "Node.js",
    index_meta: true,
    tags: ['3d-previewer', 'node']
});

if (!fs.existsSync("./files")) {
	fs.mkdirSync("./files");
}


/* database connection
========================================================================== */

mongoose.connect(process.env.DATABASE_URI || DEFAULT_DATABASE_URI, {
	useNewUrlParser: true,
	useFindAndModify: false
}, function(err) {
	if (err) {
		app.locals.logger.error("Initialization: Error connecting to database '3dpreviewer'", {meta: {err: err.message}});
		console.error("- ERROR connecting to database '3dpreviewer'\n     " + err.message);
	} else {
		app.locals.logger.log("Initialization: Connected to database '3dpreviewer'");
		console.log("> Connected to database '3dpreviewer'");
		databaseInit.deleteOldRecords(app);
		databaseInit.loadDefaultDB(app);
	}
});


/* API
========================================================================== */

app.get('/file', cors(corsOpts), api.getAll);
app.post('/file', cors(corsOpts), api.upload);

app.get('/file/:id', cors(corsOpts), api.getById);
app.delete('/file/:id', cors(corsOpts), api.deleteById);

app.get('/checkStatus', cors(), api.checkStatus);


/* app connection
========================================================================== */

app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => { res.sendStatus(500); });

app.listen(process.env.PORT || DEFAULT_PORT, function () {
	app.locals.logger.log("Initialization: 3D Previewer server running on http://localhost:" + (process.env.PORT || DEFAULT_PORT));
	console.log("> 3D Previewer server running on http://localhost:" + (process.env.PORT || DEFAULT_PORT));
});