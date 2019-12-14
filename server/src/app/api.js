"use strict";

/* packages
========================================================================== */

var Busboy = require("busboy");
var mongoose = require("mongoose");
var fs = require("fs");
var zlib = require("zlib");


/* controllers and models
========================================================================== */

var Parser = require("./parser.js");
var Geometry = require("./geometryModel.js");


/* API
========================================================================== */

exports.upload = function(req, res) {
	var form = new Busboy({headers: req.headers});
	req.pipe(form);


	form.on("file", function(fieldname, file, filename, encoding, mimetype) {
		var dataChunks = [];
		var dataLength = 0;

		file.on("data", function(chunk) {
			dataChunks.push(chunk);
			dataLength += chunk.length;
		}).on("end", function() {
			writeLog(4, "All chunks of the file captured", {origin: req.connection.remoteAddress, fileName: filename, chunksCount: dataChunks.length});

			/* File assembly */
			var data = new Buffer.alloc(dataLength);

			for (var i=0, pos=0; i<dataChunks.length; i++) {
				dataChunks[i].copy(data, pos);
				pos += dataChunks[i].length;
			}

			writeLog(4, "File assembled", {origin: req.connection.remoteAddress, fileName: filename});

			/* File processing */
			fileProcessing(filename, data);
		});
	}).on("error", function(err) {
		writeLog(1, "Error at file reading", {origin: req.connection.remoteAddress, fileName: filename, error: err.message});
		res.sendStatus(500);
	});


	function fileProcessing(fileName, data) {
		try {
			/* File parse */
			var plotData = Parser.parse(fileName, data);
			writeLog(4, "File parsed", {origin: req.connection.remoteAddress, fileName: fileName});

			/* Response to client */
			res.status(201).send(plotData);

			/* Geometry storage */
			if (mongoose.connection.readyState === 1) {
				var uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};
				var deflated = zlib.deflateSync(JSON.stringify(plotData));

				Geometry.create({
					name: fileName,
					path: "./files/" + uuid()
				}, function(err, query) {
					if (err) {
						writeLog(1, "Error at geometry storage", {origin: req.connection.remoteAddress, fileName: fileName, error: err.message});
						res.sendStatus(500);
					} else {
						fs.writeFileSync(query.path, deflated);
						writeLog(3, "Geometry stored", {origin: req.connection.remoteAddress, fileName: fileName, path: query.path});
					}
				});
			} else {
				writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
				res.sendStatus(500);
			}

		} catch (err) {
			writeLog(1, "Error at file procesing", {origin: req.connection.remoteAddress, fileName: fileName, error: err.message});
			res.sendStatus(500);
		}
	}

	function writeLog(type, msg, meta) {
		msg = "Upload File: " + msg;

		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {meta: meta});
				break;
			case 3:
				req.app.locals.logger.log(msg, {meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {meta: meta});
		}
    }
};


exports.getAll = function(req, res) {
	if (mongoose.connection.readyState === 1) {
		Geometry.find({}, {
			_id: 1,
			name: 1,
			date: 1
		}, function(err, query) {
			if (err) {
				writeLog(1, "Error at getting files list", {origin: req.connection.remoteAddress, error: err.message});
				res.sendStatus(500);
			} else {
				writeLog(3, "Files list obtained", {origin: req.connection.remoteAddress, fileListCount: query.length});
				res.status(200).json(query);
			}
		});
	} else {
		writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
		res.sendStatus(500);
	}

	function writeLog(type, msg, meta) {
		msg = "Get Files List: " + msg;

		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {meta: meta});
				break;
			case 3:
				req.app.locals.logger.log(msg, {meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {meta: meta});
		}
    }
};


exports.getById = function(req, res) {
	if (mongoose.connection.readyState === 1) {
		Geometry.findOne({
			_id: req.params.id
		}, {
			_id: 0,
			path: 1
		}, function(err, query) {
			if (err) {
				writeLog(1, "Error at getting geometry", {origin: req.connection.remoteAddress, fileId: req.params.id, error: err.message});
				res.sendStatus(500);
			} else if (query) {
				if (fs.existsSync(query.path)) {
					let data = fs.readFileSync(query.path);
					let inflated = zlib.inflateSync(new Buffer.from(data));
					let geometry = JSON.parse(inflated);

					writeLog(3, "Geometry obtained", {origin: req.connection.remoteAddress, fileId: req.params.id});
					res.status(200).json(geometry);
				} else {
					removeLostFile();
				}
			} else {
				writeLog(2, "File to retrieve not found", {origin: req.connection.remoteAddress, fileId: req.params.id});
				res.sendStatus(404);
			}
		});
	} else {
		writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
		res.sendStatus(500);
	}

	function removeLostFile() {
		Geometry.findOneAndRemove({
			_id: req.params.id
		}, {
			select: {
				_id: 0
			}
		}, function(err, query) {
			if (err) {
				writeLog(1, "Error at removing lost geometry", {origin: req.connection.remoteAddress, fileId: req.params.id, error: err.message});
				res.sendStatus(500);
			} else if (query) {
				writeLog(3, "Geometry lost and removed", {origin: req.connection.remoteAddress, fileId: req.params.id});
				res.sendStatus(200);
			} else {
				writeLog(2, "File to remove not found", {origin: req.connection.remoteAddress, fileId: req.params.id});
				res.sendStatus(404);
			}
		});
	}

	function writeLog(type, msg, meta) {
		msg = "Get File: " + msg;

		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {meta: meta});
				break;
			case 3:
				req.app.locals.logger.log(msg, {meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {meta: meta});
		}
    }
};


exports.deleteById = function(req, res) {
	if (mongoose.connection.readyState === 1) {
		Geometry.findOneAndRemove({
			_id: req.params.id
		}, {
			select: {
				_id: 0,
				path: 1
			}
		}, function(err, query) {
			if (err) {
				writeLog(1, "Error at removing geometry", {origin: req.connection.remoteAddress, fileId: req.params.id, error: err.message});
				res.sendStatus(500);
			} else if (query) {
				if (fs.existsSync(query.path)) {
					fs.unlinkSync(query.path);
				}

				writeLog(3, "Geometry removed",  {origin: req.connection.remoteAddress, fileId: req.params.id});
				res.sendStatus(200);
			} else {
				writeLog(2, "File not found",  {origin: req.connection.remoteAddress, fileId: req.params.id});
				res.sendStatus(404);
			}
		});
	} else {
		writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
		res.sendStatus(500);
	}

	function writeLog(type, msg, meta) {
		msg = "Delete File: " + msg;

		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {meta: meta});
				break;
			case 3:
				req.app.locals.logger.log(msg, {meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {meta: meta});
		}
    }
};


exports.checkStatus = function(req, res) {
	checkDatabase(0);

	function checkDatabase(attempt) {
		if (mongoose.connection.readyState === 1) {
			Geometry.find({}, {
				_id: 0,
				date: 1
			}, function(err, query) {
				if (err) {
					if (attempt < 2) {
						setTimeout(() => {
							checkDatabase(++attempt);
						}, 5000);
					} else {
						writeLog(1, "Error accessing Geometries collection", {origin: req.connection.remoteAddress, error: err.message});
						res.sendStatus(500);
					}
				} else {
					writeLog(3, "Database connected and Geometries collection accessible", {origin: req.connection.remoteAddress});
					res.sendStatus(200);
				}
			});
		} else {
			if (attempt < 2) {
			    setTimeout(() => {
					checkDatabase(++attempt);
			    }, 5000);
			} else {
				writeLog(1, "Database disconnected", {origin: req.connection.remoteAddress});
				res.sendStatus(500);
			}
		}
	}

	function writeLog(type, msg, meta) {
		switch (type) {
			case 1:
				req.app.locals.logger.error(msg, {app: 'Status Check', meta: meta});
				break;
			case 2:
				req.app.locals.logger.warn(msg, {app: 'Status Check', meta: meta});
				break;
			case 3:
				req.app.locals.logger.log(msg, {app: 'Status Check', meta: meta});
				break;
			default:
				req.app.locals.logger.debug(msg, {app: 'Status Check', meta: meta});
		}
    }
};