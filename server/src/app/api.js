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


/* Directories
========================================================================== */

if (!fs.existsSync("./files")) {fs.mkdirSync("./files");}


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
			writeLog(40, [filename, dataChunks.length]);

			/* File assembly */
			var data = new Buffer.alloc(dataLength);

			for (var i=0, pos=0; i<dataChunks.length; i++) {
				dataChunks[i].copy(data, pos);
				pos += dataChunks[i].length;
			}

			writeLog(41, filename);

			/* File processing */
			fileProcessing(filename, data);
		});
	}).on("error", function(err) {
		writeLog(10, [filename, err.message]);
		res.sendStatus(500);
	});


	function fileProcessing(fileName, data) {
		try {
			/* File parse */
			var plotData = Parser.parse(fileName, data);
			writeLog(42, fileName);

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
						writeLog(13, [fileName, err.message]);
						res.sendStatus(500);
					} else {
						fs.writeFileSync(query.path, deflated);
						writeLog(30, [fileName, query.path]);
					}
				});
			} else {
				writeLog(12, null);
				res.sendStatus(500);
			}

		} catch (err) {
			writeLog(11, [fileName, err.message]);
			res.sendStatus(500);
		}
	}

	function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'UPLOAD',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
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
				writeLog(11, err.message);
				res.sendStatus(500);
			} else {
				writeLog(30, query.length);
				res.status(200).json(query);
			}
		});
	} else {
		writeLog(10, null);
		res.sendStatus(500);
	}

	function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'GETALL',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
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
				writeLog(11, [req.params.id, err.message]);
				res.sendStatus(500);
			} else if (query) {
				if (fs.existsSync(query.path)) {
					let data = fs.readFileSync(query.path);
					let inflated = zlib.inflateSync(new Buffer.from(data));
					let geometry = JSON.parse(inflated);

					writeLog(30, req.params.id);
					res.status(200).json(geometry);
				} else {
					removeLostFile();
				}
			} else {
				writeLog(20, req.params.id);
				res.sendStatus(404);
			}
		});
	} else {
		writeLog(10, null);
		res.sendStatus(500);
	}

	function removeLostFile() {
		Geometry.findOneAndRemove({
			_id: req.params.id
		}, {
			select: {
				_id: 0
			}
		}, function(err, query) {
			if (err) {
				writeLog(12, [req.params.id, err.message]);
				res.sendStatus(500);
			} else if (query) {
				writeLog(31, req.params.id);
				res.sendStatus(200);
			} else {
				writeLog(21, req.params.id);
				res.sendStatus(404);
			}
		});
	}

	function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'GETBYID',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
        }
    }
};


exports.deleteById = function(req, res) {
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
				writeLog(11, [req.params.id, err.message]);
				res.sendStatus(500);
			} else if (query) {
				if (fs.existsSync(query.path)) {
					fs.unlinkSync(query.path);
				}

				writeLog(30, req.params.id);
				res.sendStatus(200);
			} else {
				writeLog(20, req.params.id);
				res.sendStatus(404);
			}
		});
	} else {
		writeLog(10, null);
		res.sendStatus(500);
	}

	function writeLog(code, info) {
        if (code < req.app.locals.logger.level) {
            req.app.locals.logger.history.push({
                date: new Date(),
                origin: req.connection.remoteAddress,
                request: 'DELETEBYID',
                code: code,
                info: info
            });

            fs.writeFileSync(req.app.locals.logPath, JSON.stringify(req.app.locals.logger), {encoding: 'utf8', flag: 'w'});
        }
    }
};