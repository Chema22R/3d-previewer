var controller3D;

$(function() {
	controller3D = new controller3D();
	controller3D.init();
});

function controller3D() {
	var scene, camera, light, renderer, controls, material, materialWF, boundingBox, geometry, mesh;
	var originalSize;

	var wrapper = $(".previewControl.wrapper");
	var colorPicker = new CP(document.querySelector(".palette.icon")).set("#aaaaaa");


	/* Public functions
    ========================================================================== */

	this.init = function() {
		// scene
		scene = new THREE.Scene();

		// camera
		camera = new THREE.PerspectiveCamera(75, wrapper.width() / wrapper.height(), 1, 1000);
		camera.position.set(0, 0, 100);
		scene.add(camera);

		// light
		light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
		camera.add(light);

		// renderer
		renderer = new THREE.WebGLRenderer({
			canvas: $("canvas.previewControl").get(0),
			antialias: true
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(wrapper.width(), wrapper.height());
		renderer.setClearColor(0x202020);

		// controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);

		// materials
		material = new THREE.MeshPhongMaterial({
			color: 0xaaaaaa,
			shading: THREE.FlatShading,
			wireframe: false
		});

		materialWF = new THREE.MeshBasicMaterial({
			color: 0xaaaaaa,
			shading: THREE.SmoothShading,
			wireframe: true,
			wireframeLinewidth: 1
		});

		// bounding box to calculate the mesh size
		boundingBox = new THREE.Box3()

		animate();
	};

	this.loadMesh = function(plotData) {
		if (mesh) {
			scene.remove(mesh);					// old mesh deletion
			colorPicker.set("#aaaaaa");			// color picker reset
			material.color.setHex("0xaaaaaa");	// material color
			materialWF.color.setHex("0xaaaaaa");// materialWF color
		} else {
			$(".navbar.right").fadeIn("slow");
		}

		controls.reset();	// camera reset

		// geometry
		geometry = geometryCalculator(new THREE.BufferGeometry(), plotData);
		geometry.center();

		// mesh
		mesh = new THREE.Mesh(geometry, material);
		originalSize = boundingBox.setFromObject(mesh).getSize();

		if ((originalSize.x < 100) && (originalSize.y < 100) && (originalSize.z < 100) ||
			(originalSize.x > 100) || (originalSize.y > 100) || (originalSize.z > 100)) {	// scales the mesh to a standard size
			var aux = originalSize.x;

			if (aux < originalSize.y) {aux = originalSize.y;}
			if (aux < originalSize.z) {aux = originalSize.z;}

			mesh.scale.multiplyScalar(100/aux);
		}

		scene.add(mesh);
	}


	/* Private functions
    ========================================================================== */

	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	function geometryCalculator(geometry, plotData) {
		if (plotData.type === "stl") {
			if (plotData.vertices.length > 0) {geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(plotData.vertices), 3));}

			if (plotData.normals.length > 0) {
				var normals = [];

				for (var i=0; i<plotData.normals.length; i+=3) {
					normals.push(plotData.normals[i], plotData.normals[i+1], plotData.normals[i+2]);
					normals.push(plotData.normals[i], plotData.normals[i+1], plotData.normals[i+2]);
					normals.push(plotData.normals[i], plotData.normals[i+1], plotData.normals[i+2]);
				}

				geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
			}
		} else if (plotData.type === "ply") {
			if (plotData.indices.length > 0) {geometry.setIndex(plotData.indices);}
			if (plotData.vertices.length > 0) {geometry.addAttribute("position", new THREE.Float32BufferAttribute(plotData.vertices, 3));}
			if (plotData.normals.length > 0) {geometry.addAttribute("normal", new THREE.Float32BufferAttribute(plotData.normals, 3));}
			geometry.computeBoundingSphere();
		} else if (plotData.type === "obj") {
			if (plotData.vertices.length > 0) {geometry.addAttribute("position", new THREE.Float32BufferAttribute(plotData.vertices, 3));}
			if (plotData.normals.length > 0) {geometry.addAttribute("normal", new THREE.Float32BufferAttribute(plotData.normals, 3));}
		}

		return geometry;
	}


	/* Event handlers
    ========================================================================== */

	$(window).resize(function() {	// adjust the 3d control to the window size
		camera.aspect = wrapper.width() / wrapper.height();
		camera.updateProjectionMatrix();
		
		renderer.setSize(wrapper.width(), wrapper.height());
	});

	$(".navbar.right .reset.icon").click(function(e) {	// Reset button: restore the initial object and camera position
		e.preventDefault();

		mesh.rotation.x = 0;
		mesh.rotation.y = 0;
		mesh.rotation.z = 0;

		controls.reset();	// camera reset
	});

	$(".rotatorArrows *").click(function(e) {	// Rotator buttons: change the initial object position
		e.preventDefault();

		var matrixRot = new THREE.Matrix4();

		switch ($(this).attr("class").split(" ")[0]) {
			case "icon-arrow-up":
				matrixRot.makeRotationAxis(new THREE.Vector3(1,0,0).normalize(), Math.PI / 2);
				break;
			case "icon-arrow-down":
				matrixRot.makeRotationAxis(new THREE.Vector3(1,0,0).normalize(), -Math.PI / 2);
				break;
			case "icon-arrow-right":
				matrixRot.makeRotationAxis(new THREE.Vector3(0,1,0).normalize(), -Math.PI / 2);
				break;
			case "icon-arrow-left":
				matrixRot.makeRotationAxis(new THREE.Vector3(0,1,0).normalize(), Math.PI / 2);
				break;
		}

		mesh.matrix = matrixRot.multiply(mesh.matrix);
		mesh.rotation.setFromRotationMatrix(mesh.matrix);
	});

	$(".navbar.right .wireframe.icon").click(function(e) {	// Wireframe button: toggle between normal and wireframe visualization
		e.preventDefault();
		
		if (mesh.material.uuid === material.uuid) {
			mesh.material = materialWF;
		} else {
			mesh.material = material;
		}
	});

	colorPicker.on("change", function(color) {	// Palette button: detect the color selected and paint the mesh
		if (mesh) {
			material.color.setHex("0x"+color);
			materialWF.color.setHex("0x"+color);
		}
	});
}