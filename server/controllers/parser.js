
exports.parse = function(fileName, data) {
	var parser;

	switch (fileName.substring(fileName.lastIndexOf(".")+1).toLowerCase()) {
		case "stl":
			parser = new stl();
			break;
		case "ply":
			parser = new ply();
			break;
		case "obj":
			parser = new obj();
			break;
		default: break;
	}
	
	return parser.parse(data);
};


/* parsers
========================================================================== */

var stl = function() {
	this.parse = function(data) {
		var binData = ensureBinary(data);

		return isBinary(binData) ? parseBinary(binData) : parseASCII(ensureString(data));
	};


	function parseBinary(data) {
		var reader = new DataView(data);
		var faces = reader.getUint32(80, true);

		var dataOffset = 84;
		var faceLength = 12 * 4 + 2;

		var vertices = [];
		var normals = [];

		for (var face=0; face<faces; face++) {
			var start = dataOffset + face * faceLength;
			var normalX = reader.getFloat32(start, true);
			var normalY = reader.getFloat32(start + 4, true);
			var normalZ = reader.getFloat32(start + 8, true);

            normals.push(normalX, normalY, normalZ);

			for (var i=1; i<=3; i++) {
				var vertexstart = start + i * 12;

				vertices.push(reader.getFloat32(vertexstart, true));
				vertices.push(reader.getFloat32(vertexstart + 4, true));
				vertices.push(reader.getFloat32(vertexstart + 8, true));
			}
		}

		if ((vertices.length == 0) || (normals.length == 0)) {
			throw new Error("STL malformed");
		}

        return {
			type: "stl",
            vertices: vertices,
            normals: normals
        };
	}

	function parseASCII(data) {
		var length, patternFace, patternNormal, patternVertex, result, text;
		patternFace = /facet([\s\S]*?)endfacet/g;

		var vertices = [];
		var normals = [];

		while ((result = patternFace.exec(data)) !== null) {
			text = result[0];
			patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ((result = patternNormal.exec(text)) !== null) {
                normals.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
			}

			patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ((result = patternVertex.exec(text)) !== null) {
				vertices.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
			}
		}

		if ((vertices.length == 0) || (normals.length == 0)) {
			throw new Error("STL malformed");
		}

		return {
			type: "stl",
            vertices: vertices,
            normals: normals
        };
	}

	function ensureString(buf) {
		if (typeof buf !== "string") {
			var array_buffer = new Uint8Array(buf);
			var strArray = [];

			for (var i=0; i<buf.byteLength; i++) {
				strArray.push(String.fromCharCode(array_buffer[i]));
			}

			return strArray.join("");
		} else {
			return buf;
		}
	}

    function ensureBinary(buf) {
		if (typeof buf === "string") {
			var array_buffer = new Uint8Array(buf.length);

			for (var i=0; i<buf.length; i++) {
				array_buffer[i] = buf.charCodeAt(i) & 0xff;
			}

			return array_buffer.buffer || array_buffer;
		} else {
			return buf.buffer || buf;
		}
	}

	function isBinary(binData) {
		var expect, face_size, n_faces, reader;

		reader = new DataView(binData);
		face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
		n_faces = reader.getUint32(80, true);
		expect = 80 + (32 / 8) + (n_faces * face_size);

		if (expect === reader.byteLength) {
			return true;
		}

		var fileLength = reader.byteLength;

		for (var i=0; i<fileLength; i++) {
			if (reader.getUint8(i, false) > 127) {
				return true;
			}
		}

		return false;
	}
};


var ply = function() {
	this.parse = function (data) {
		var geometry;

		if (data instanceof ArrayBuffer) {
			geometry = isASCII(data) ? parseASCII(bin2str(data)) : parseBinary(data);
		} else {
			geometry = parseASCII(data);
		}

		return geometry;
	};


	function isASCII(data) {
		var header = parseHeader(bin2str(data));
		return header.format === "ascii";
	}

	function bin2str( buf ) {
		var array_buffer = new Uint8Array( buf );
		var str = "";

		for (var i=0; i<buf.byteLength; i++) {
			str += String.fromCharCode(array_buffer[i] );
		}

		return str;
	}

	function parseHeader(data) {
		var patternHeader = /ply([\s\S]*)end_header\s/;
		var headerText = "";
		var headerLength = 0;
		var result = patternHeader.exec(data);

		if (result !== null) {
			headerText = result[1];
			headerLength = result[0].length;
		} else {
			throw new Error("PLY malformed");
		}

		var header = {
			comments: [],
			elements: [],
			headerLength: headerLength
		};

		var lines = headerText.split("\n");
		var currentElement;
		var lineType, lineValues;

		function make_ply_element_property(propertValues) {
			var property = {
				type: propertValues[0]
			};

			if (property.type === "list") {
				property.name = propertValues[3];
				property.countType = propertValues[1];
				property.itemType = propertValues[2];
			} else {
				property.name = propertValues[1];
			}

			return property;
		}

		for (var i=0; i<lines.length; i++) {
			var line = lines[i];
			line = line.trim();

			if (line === "") {continue;}

			lineValues = line.split(/\s+/);
			lineType = lineValues.shift();
			line = lineValues.join(" ");

			switch (lineType) {
				case "format":
					header.format = lineValues[0];
					header.version = lineValues[1];
					break;
				case "comment":
					header.comments.push(line);
					break;
				case "element":
					if (currentElement !== undefined) {
						header.elements.push(currentElement);
					}
					currentElement = {};
					currentElement.name = lineValues[0];
					currentElement.count = parseInt(lineValues[1]);
					currentElement.properties = [];
					break;
				case "property":
					currentElement.properties.push(make_ply_element_property(lineValues));
					break;
				default:
					console.log("unhandled", lineType, lineValues);
			}
		}

		if (currentElement !== undefined) {
			header.elements.push(currentElement);
		}

		return header;
	}

	function parseASCIINumber(n, type) {
		switch (type) {
			case "char": case "uchar": case "short": case "ushort": case "int": case "uint":
			case "int8": case "uint8": case "int16": case "uint16": case "int32": case "uint32":
				return parseInt(n);
			case "float": case "double": case "float32": case "float64":
				return parseFloat(n);
		}
	}

	function parseASCIIElement(properties, line) {
		var values = line.split(/\s+/);
		var element = {};

		for (var i=0; i<properties.length; i++) {
			if (properties[i].type === "list") {
				var list = [];
				var n = parseASCIINumber(values.shift(), properties[i].countType);

				for (var j=0; j<n; j++) {
					list.push(parseASCIINumber(values.shift(), properties[i].itemType));
				}

				element[properties[i].name] = list;
			} else {
				element[properties[i].name] = parseASCIINumber(values.shift(), properties[i].type);
			}
		}

		return element;
	}

	function parseASCII(data) {
		var buffer = {
			type: "ply",
			indices: [],
			vertices: [],
			normals: []
		};
		var result;
		var header = parseHeader(data);
		var patternBody = /end_header\s([\s\S]*)$/;
		var body = "";

		if ((result = patternBody.exec(data)) !== null) {
			body = result [1];
		} else {
			throw new Error("PLY malformed");
		}

		var lines = body.split("\n");
		var currentElement = 0;
		var currentElementCount = 0;

		for (var i=0; i<lines.length; i++) {
			var line = lines[i];

			line = line.trim();

			if (line === "") {continue;}

			if (currentElementCount >= header.elements[currentElement].count) {
				currentElement ++;
				currentElementCount = 0;
			}

			var element = parseASCIIElement(header.elements[currentElement].properties, line);

			handleElement(buffer, header.elements[currentElement].name, element);

			currentElementCount++;
		}

		return buffer;
	}

	function handleElement(buffer, elementName, element) {
		if (elementName === "vertex") {
			buffer.vertices.push(element.x, element.y, element.z);
			
			if ("nx" in element && "ny" in element && "nz" in element) {
				buffer.normals.push(element.nx, element.ny, element.nz);
			}
		} else if (elementName === "face") {
			var vertex_indices = element.vertex_indices || element.vertex_index;

			if (vertex_indices.length === 3) {
				buffer.indices.push(vertex_indices[0], vertex_indices[1], vertex_indices[2]);
			} else if (vertex_indices.length === 4) {
				buffer.indices.push(vertex_indices[0], vertex_indices[1], vertex_indices[3]);
				buffer.indices.push(vertex_indices[1], vertex_indices[2], vertex_indices[3]);
			}
		}
	}

	function binaryRead(dataview, at, type, little_endian) {
		switch (type) {
			case "int8":	case "char":	return [dataview.getInt8(at), 1];
			case "uint8":	case "uchar":	return [dataview.getUint8(at), 1];
			case "int16":	case "short":	return [dataview.getInt16(at, little_endian), 2];
			case "uint16":	case "ushort":	return [dataview.getUint16(at, little_endian), 2];
			case "int32":	case "int":		return [dataview.getInt32(at, little_endian), 4];
			case "uint32":	case "uint":	return [dataview.getUint32(at, little_endian), 4];
			case "float32": case "float":	return [dataview.getFloat32(at, little_endian), 4];
			case "float64": case "double":	return [dataview.getFloat64(at, little_endian), 8];
		}
	}

	function binaryReadElement(dataview, at, properties, little_endian) {
		var element = {};
		var result, read = 0;

		for (var i=0; i<properties.length; i++) {
			if (properties[i].type === "list") {
				var list = [];

				result = binaryRead(dataview, at+read, properties[i].countType, little_endian);
				var n = result[0];
				read += result[1];

				for (var j=0; j<n; j++) {
					result = binaryRead(dataview, at+read, properties[i].itemType, little_endian);
					list.push(result[0]);
					read += result[1];
				}

				element[properties[i].name] = list;
			} else {
				result = binaryRead(dataview, at+read, properties[i].type, little_endian);
				element[properties[i].name] = result[0];
				read += result[1];
			}
		}

		return [element, read];
	}

	function parseBinary(data) {
		var buffer = {
			type: "ply",
			indices: [],
			vertices: [],
			normals: []
		};
		
		var header = parseHeader(bin2str(data));
		var little_endian = (header.format === "binary_little_endian");
		var body = new DataView(data, header.headerLength);
		var result, loc = 0;

		for (var currentElement=0; currentElement<header.elements.length; currentElement++) {
			for (var currentElementCount=0; currentElementCount<header.elements[currentElement].count; currentElementCount++) {
				result = binaryReadElement(body, loc, header.elements[currentElement].properties, little_endian);
				loc += result[1];
				var element = result[0];

				handleElement(buffer, header.elements[currentElement].name, element);
			}
		}

		return postProcess(buffer);
	}
};


var obj = function() {
	this.parse = function (text) {
		text = text.toString();

		var pattern = {
			vertex: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
			normal: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
			uv: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
			face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
			face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
			face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
			face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/
		};

		var controller = createController();

		if (text.indexOf("\r\n") !== - 1) {
			text = text.replace(/\r\n/g, "\n");
		}

		if (text.indexOf("\\\n") !== - 1) {
			text = text.replace(/\\\n/g, "");
		}

		var lines = text.split("\n");
		var line = "", lineFirstChar = "", lineSecondChar = "";
		var lineLength = 0;
		var result = [];

		for (var i=0, l=lines.length; i<l; i++) {
			line = lines[i].trim();
			lineLength = line.length;

			if (lineLength === 0) continue;

			lineFirstChar = line.charAt(0);

			if (lineFirstChar === "#") continue;

			if (lineFirstChar === "v") {
				lineSecondChar = line.charAt(1);

				if (lineSecondChar === " " && (result = pattern.vertex.exec(line)) !== null) {
					controller.verticesAux.push(	// ["v 1.0 2.0 3.0"]
						parseFloat(result[1]),
						parseFloat(result[2]),
						parseFloat(result[3])
					);
				} else if (lineSecondChar === "n" && (result = pattern.normal.exec(line)) !== null) {
					controller.normalsAux.push(	// ["vn 1.0 2.0 3.0"]
						parseFloat(result[1]),
						parseFloat(result[2]),
						parseFloat(result[3])
					);
				} else if (lineSecondChar === "t" && (result = pattern.uv.exec(line)) !== null) {
				} else {
					throw new Error("OBJ malformed");
				}
			} else if (lineFirstChar === "f") {
				if ((result = pattern.face_vertex_uv_normal.exec(line)) !== null) {
					controller.addFace(	// f vertex/uv/normal vertex/uv/normal vertex/uv/normal -> ["f 1/1/1 2/2/2 3/3/3"]
						result[1], result[4], result[7], result[10],
						result[2], result[5], result[8], result[11],
						result[3], result[6], result[9], result[12]
					);
				} else if ((result = pattern.face_vertex_uv.exec(line)) !== null) {
					controller.addFace(	// f vertex/uv vertex/uv vertex/uv -> ["f 1/1 2/2 3/3"]
						result[1], result[3], result[5], result[7],
						result[2], result[4], result[6], result[8]
					);
				} else if ((result = pattern.face_vertex_normal.exec(line)) !== null) {
					controller.addFace(	// f vertex//normal vertex//normal vertex//normal -> ["f 1//1 2//2 3//3"]
						result[1], result[3], result[5], result[7],
						undefined, undefined, undefined, undefined,
						result[2], result[4], result[6], result[8]
					);
				} else if ((result = pattern.face_vertex.exec(line)) !== null) {
					controller.addFace(	// f vertex vertex vertex -> ["f 1 2 3"]
						result[1], result[2], result[3], result[4]
					);
				} else {
					throw new Error("OBJ malformed");
				}
			} else if (lineFirstChar === "l") {
				var lineParts = line.substring(1).trim().split(" ");
				var lineVertices = [];

				if (line.indexOf("/") === - 1) {
					lineVertices = lineParts;
				} else {
					for (var li = 0, llen = lineParts.length; li < llen; li ++) {
						var parts = lineParts[li].split("/");

						if (parts[0] !== "") lineVertices.push(parts[0]);
					}
				}

				controller.addLineGeometry(lineVertices);
			}
		}

		return {
			type: "obj",
			vertices: controller.vertices,
			normals: controller.normals
		};
	};

	function createController() {
		var controller = {
			verticesAux: [],
			normalsAux: [],

			vertices: [],
			normals: [],

			parseVertexIndex: function (value, len) {
				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 3) * 3;
			},

			parseNormalIndex: function (value, len) {
				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 3) * 3;
			},

			parseUVIndex: function (value, len) {
				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 2) * 2;
			},

			addVertex: function (a, b, c) {
				var src = this.verticesAux;
				var dst = this.vertices;

				dst.push(src[a + 0]);
				dst.push(src[a + 1]);
				dst.push(src[a + 2]);
				dst.push(src[b + 0]);
				dst.push(src[b + 1]);
				dst.push(src[b + 2]);
				dst.push(src[c + 0]);
				dst.push(src[c + 1]);
				dst.push(src[c + 2]);
			},

			addVertexLine: function (a) {
				var src = this.verticesAux;
				var dst = this.vertices;

				dst.push(src[a + 0]);
				dst.push(src[a + 1]);
				dst.push(src[a + 2]);
			},

			addNormal: function (a, b, c) {
				var src = this.normalsAux;
				var dst = this.normals;

				dst.push(src[a + 0]);
				dst.push(src[a + 1]);
				dst.push(src[a + 2]);
				dst.push(src[b + 0]);
				dst.push(src[b + 1]);
				dst.push(src[b + 2]);
				dst.push(src[c + 0]);
				dst.push(src[c + 1]);
				dst.push(src[c + 2]);
			},

			addFace: function (a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
				var vLen = this.verticesAux.length;

				var ia = this.parseVertexIndex(a, vLen);
				var ib = this.parseVertexIndex(b, vLen);
				var ic = this.parseVertexIndex(c, vLen);
				var id;

				if (d === undefined) {
					this.addVertex(ia, ib, ic);
				} else {
					id = this.parseVertexIndex(d, vLen);

					this.addVertex(ia, ib, id);
					this.addVertex(ib, ic, id);
				}

				if (na !== undefined) {
					var nLen = this.normalsAux.length;
					ia = this.parseNormalIndex(na, nLen);

					ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
					ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

					if (d === undefined) {
						this.addNormal(ia, ib, ic);
					} else {
						id = this.parseNormalIndex(nd, nLen);

						this.addNormal(ia, ib, id);
						this.addNormal(ib, ic, id);
					}
				}
			},

			addLineGeometry: function (verticesAux) {
				this.type = "Line";

				var vLen = this.verticesAux.length;

				for (var vi=0, l=verticesAux.length; vi<l; vi++) {
					this.addVertexLine(this.parseVertexIndex(verticesAux[vi], vLen));
				}
			}
		};

		return controller;
	};
};