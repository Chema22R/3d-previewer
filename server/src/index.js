"use strict";

/* packages
========================================================================== */

var express = require("express");
var app = express();

var cors = require("cors");
var bodyParser = require("body-parser");
const { Logtail } = require("@logtail/node");
var Sentry = require('@sentry/node');
var fs = require("fs");
var mongoose = require("mongoose");


/* sentry
========================================================================== */

Sentry.init({ dsn: DEFAULT_SENTRY_DSN, environment: DEFAULT_ENV });
app.use(Sentry.Handlers.requestHandler());


/* controllers
========================================================================== */

var api = require("./app/api.js");
var databaseInit = require("./app/databaseInit.js");


/* cors configuration
========================================================================== */

var corsOpts = {
	origin: DEFAULT_CORS_ORIGIN
};
app.options("/file/:id", cors(corsOpts));	// enable pre-flight request


/* app configuration
========================================================================== */

app.use(bodyParser.json());


/* log and files
========================================================================== */

app.locals.logger = new Logtail(DEFAULT_LOGGER_KEY);

if (!fs.existsSync("./files")) {
	fs.mkdirSync("./files");
}


/* database connection
========================================================================== */

mongoose.connect(DEFAULT_DATABASE_URI, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology: true
}, function(err) {
	if (err) {
		app.locals.logger.error("Initialization: Error connecting to database '3dpreviewer'", {meta: {err: err.message}});
		console.error("- ERROR connecting to database '3dpreviewer'\n     " + err.message);
	} else {
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

app.get('/health', cors(), api.checkStatus);


/* app connection
========================================================================== */

app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => { res.sendStatus(500); });

app.listen(process.env.PORT || DEFAULT_PORT, function () {
	console.log("> 3D Previewer server running on http://localhost:" + (process.env.PORT || DEFAULT_PORT));
});
