
/* packages
========================================================================== */

var Busboy = require("busboy");
var mongoose = require("mongoose");
var fs = require("fs");
var zlib = require("zlib");
var Console = require("console").Console;


/* controllers and models
========================================================================== */

var Parser = require("./parser.js");

var Geometry = require("./../models/model.js");


/* Directories
========================================================================== */

if (!fs.existsSync("./log")) {fs.mkdirSync("./log");}
if (!fs.existsSync("./files")) {fs.mkdirSync("./files");}


/* Log
========================================================================== */

var log = fs.createWriteStream("./log/node.log", {flags: "a"});
var logErr = fs.createWriteStream("./log/error.log", {flags: "a"});
var logger = new Console(log, logErr);


/* API
========================================================================== */

exports.upload = function(req, res) {
	logger.log("\n> UPLOAD request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
	logger.time("  UPLOAD request completed");

	var form = new Busboy({headers: req.headers});
	req.pipe(form);


	form.on("file", function(fieldname, file, filename, encoding, mimetype) {
		logger.log("    New file '" + filename + "' detected");

		var dataChunks = [];
		var dataLength = 0;

		file.on("data", function(chunk) {
			dataChunks.push(chunk);
			dataLength += chunk.length;
		}).on("end", function() {
			logger.log("    All chunks of the file captured (" + dataChunks.length + " chunks)");

			/* File assembly */

			logger.time("    File assembled");
			var data = new Buffer(dataLength);

			for (var i=0, pos=0; i<dataChunks.length; i++) {
				dataChunks[i].copy(data, pos);
				pos += dataChunks[i].length;
			}
			logger.timeEnd("    File assembled");

			/* File processing */

			fileProcessing(filename, data);
		});
	}).on("error", function(err) {
		if (res.statusCode === 200) res.sendStatus(500);
		logger.error("\n- ERROR UPLOAD on file reading (" + new Date().toUTCString() + "):\n    " + err.message);
		logger.timeEnd("  UPLOAD request completed");
	});


	function fileProcessing(fileName, data) {
		try {
			/* File parse */

			logger.time("    File parsed");
			var plotData = Parser.parse(fileName, data);
			logger.timeEnd("    File parsed");

			/* Response to client */

			logger.time("    Geometry sent to client");
			res.status(201).send(plotData);
			logger.timeEnd("    Geometry sent to client");

			/* Geometry storage */

			if (mongoose.connection.readyState === 1) {
				logger.time("    Geometry stored");

				var uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};
				var deflated = zlib.deflateSync(JSON.stringify(plotData));

				Geometry.create({
					name: fileName,
					path: __dirname.replace("controllers", "") + "files/" + uuid()
				}, function(err, query) {
					if (err) {
						logger.error("\n- ERROR UPLOAD on geometry storage (" + new Date().toUTCString() + "):\n    " + err.message);
					} else {
						fs.writeFileSync(query.path, deflated);
						logger.timeEnd("    Geometry stored");
					}

					logger.timeEnd("  UPLOAD request completed");
				});
			} else {
				logger.error("\n- ERROR UPLOAD database disconnected (" + new Date().toUTCString() + ")");
				logger.timeEnd("  UPLOAD request completed");
			}

		} catch (e) {
			if (res.statusCode === 200) res.status(500).send(e.message);
			logger.error("\n- ERROR UPLOAD on file processing (" + new Date().toUTCString() + "):\n    " + e);
			logger.timeEnd("  UPLOAD request completed");
		}
	}
};


exports.getAll = function(req, res) {
	logger.log("\n> GETALL request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
	logger.time("  GETALL request completed");

	if (mongoose.connection.readyState === 1) {
		Geometry.find({}, {
			_id: 1,
			name: 1,
			date: 1
		}, function(err, query) {
			if (err) {
				res.sendStatus(500);
				logger.error("\n- ERROR GETALL on get file list (" + new Date().toUTCString() + "):\n    " + err.message);
			} else {
				logger.log("    File list obtained (" + query.length + " elements)");

				res.json(query);
				logger.log("    File list sent to client");
			}

			logger.timeEnd("  GETALL request completed");
		});
	} else {
		res.sendStatus(500);
		logger.error("\n- ERROR GETALL database disconnected (" + new Date().toUTCString() + ")");
		logger.timeEnd("  GETALL request completed");
	}
};


exports.getById = function(req, res) {
	logger.log("\n> GETBYID request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
	logger.time("  GETBYID request completed");

	if (mongoose.connection.readyState === 1) {
		Geometry.findOne({
			_id: req.params.id
		}, {
			_id: 0,
			path: 1
		}, function(err, query) {
			if (err) {
				res.sendStatus(500);
				logger.error("\n- ERROR GETBYID on get geometry (" + new Date().toUTCString() + "):\n    " + err.message);
			} else if (query) {
				var data = fs.readFileSync(query.path);
				var inflated = zlib.inflateSync(new Buffer(data));
				var geometry = JSON.parse(inflated);
				
				res.json(geometry);
				logger.log("    Geometry sent to client");
			} else {
				res.sendStatus(404);
				logger.log("    Resource not found");
			}

			logger.timeEnd("  GETBYID request completed");
		});
	} else {
		res.sendStatus(500);
		logger.error("\n- ERROR GETBYID database disconnected (" + new Date().toUTCString() + ")");
		logger.timeEnd("  GETBYID request completed");
	}
};


exports.deleteById = function(req, res) {
	logger.log("\n> DELETEBYID request initiated (" + new Date().toUTCString() + ", " + req.connection.remoteAddress + ")");
	logger.time("  DELETEBYID request completed");

	if (mongoose.connection.readyState === 1) {
		Geometry.findOneAndRemove({
			_id: req.params.id
		}, {
			select: {
				_id: 0,
				path: 1
			}
		}, function(err, query) {
			if (err) {
				res.sendStatus(500);
				logger.error("\n- ERROR DELETEBYID on delete geometry (" + new Date().toUTCString() + "):\n    " + err.message);
			} else if (query) {
				logger.log("    Metadata deleted");
				
				fs.unlinkSync(query.path);
				logger.log("    Geometry deleted");

				res.sendStatus(200);
			} else {
				res.sendStatus(404);
				logger.log("    Resource not found");
			}

			logger.timeEnd("  DELETEBYID request completed");
		});
	} else {
		res.sendStatus(500);
		logger.error("\n- ERROR DELETEBYID database disconnected (" + new Date().toUTCString() + ")");
		logger.timeEnd("  DELETEBYID request completed");
	}
};