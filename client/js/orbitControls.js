
THREE.OrbitControls = function(object, renderer) {
    this.object = object;
    this.renderer = renderer;

    this.pivot = new THREE.Vector3();

    // zoom
    this.zoomMin = 2;
	this.zoomMax = 800;
    this.zoomSpeed = 0.5;

    // rotation
    this.minPolarAngle = 0;
	this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
	this.maxAzimuthAngle = Infinity;
    this.rotateSpeed = 1.0;

    // panning
    this.panSpeed = 7.0;

    // controls
    this.mouseControls = {ROTATE: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT};
    this.keyboardControls = {ZOOMIN: 90, ZOOMOUT: 88,
		PANLEFT: 65, PANUP: 87, PANRIGHT: 68, PANDOWN: 83,
		ROTATELEFT: 37, ROTATEUP: 38, ROTATERIGHT: 39, ROTATEDOWN: 40};

    // reset
    this.pivotReset = this.pivot.clone();
	this.positionReset = this.object.position.clone();
	this.zoomReset = this.object.zoom;


    this.update = function() {
		var offset = new THREE.Vector3();

		var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
		var quatInverse = quat.clone().inverse();

		var position = scope.object.position;


		offset.copy(position).sub(scope.pivot);
		offset.applyQuaternion(quat);

		spherical.setFromVector3(offset);

		spherical.theta += sphericalDelta.theta;
		spherical.phi += sphericalDelta.phi;

		spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
		spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

		spherical.makeSafe();

		spherical.radius = Math.max(scope.zoomMin, Math.min(scope.zoomMax, spherical.radius * scale));


		scope.pivot.add(panOffset);	// moves pivot to panned location

		offset.setFromSpherical(spherical);
		offset.applyQuaternion(quatInverse);

		position.copy(scope.pivot).add(offset);

		scope.object.lookAt(scope.pivot);

		sphericalDelta.set(0, 0, 0);

		scale = 1;
		panOffset.set(0, 0, 0);
	};

	this.reset = function() {
		scope.pivot.copy(scope.pivotReset);
		scope.object.position.copy(scope.positionReset);
		scope.object.zoom = scope.zoomReset;

		scope.update();

		state = STATE.NONE;
	};


    /* Private
    ========================================================================== */

    var scope = this;

	var STATE = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5};
	var state = STATE.NONE;

	// current position
    var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	// zoom
	var scale = 1;
	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	// rotate
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	// pan
	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();
	var pan = function(deltaX, deltaY) {
		var offset = new THREE.Vector3();
		var x = new THREE.Vector3();
		var y = new THREE.Vector3();
		
		offset.copy(scope.object.position).sub(scope.pivot);
		var targetDistance = offset.length();

		targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

		x.setFromMatrixColumn(scope.object.matrix, 0);
		y.setFromMatrixColumn(scope.object.matrix, 1);
		
		x.multiplyScalar(-(2 * deltaX * targetDistance / renderer.clientHeight));
		y.multiplyScalar(2 * deltaY * targetDistance / renderer.clientHeight);

		panOffset.add(x);
		panOffset.add(y);
	};


	/* Event handlers
    ========================================================================== */

	scope.renderer.addEventListener("contextmenu", onContextMenu, false);
	scope.renderer.addEventListener("mousedown", onMouseDown, false);
	scope.renderer.addEventListener("wheel", onMouseWheel, false);
	scope.renderer.addEventListener("touchstart", onTouchStart, false);
	scope.renderer.addEventListener("touchend", onTouchEnd, false);
	scope.renderer.addEventListener("touchmove", onTouchMove, false);
	window.addEventListener("keydown", onKeyDown, false);


    function onContextMenu(event) {	// prevents the apparition of the context menu (right click)
		event.preventDefault();
	}


	function onMouseDown(event) {	// begins the mouse capture
		event.preventDefault();

		if (event.button === scope.mouseControls.ROTATE) {
			rotateStart.set(event.clientX, event.clientY);
			state = STATE.ROTATE;
		} else if (event.button === scope.mouseControls.ZOOM) {
			zoomStart.set(event.clientX, event.clientY);
			state = STATE.ZOOM;
		} else if (event.button === scope.mouseControls.PAN) {
			panStart.set(event.clientX, event.clientY);
			state = STATE.PAN;
		}

		if (state !== STATE.NONE) {
			document.addEventListener("mousemove", onMouseMove, false);
			document.addEventListener("mouseup", onMouseUp, false);
		}
	}

    function onMouseMove(event) {	// mouse motion capture
		event.preventDefault();

		if (state === STATE.ROTATE) {
			rotateEnd.set(event.clientX, event.clientY);
			rotateDelta.subVectors(rotateEnd, rotateStart);
			
			sphericalDelta.theta -= 2 * Math.PI * rotateDelta.x / renderer.clientWidth * scope.rotateSpeed;
			sphericalDelta.phi -= 2 * Math.PI * rotateDelta.y / renderer.clientHeight * scope.rotateSpeed;

			rotateStart.copy(rotateEnd);
		} else if (state === STATE.ZOOM) {
			zoomEnd.set(event.clientX, event.clientY);
			zoomDelta.subVectors(zoomEnd, zoomStart);

			if (zoomDelta.y > 0) {
				scale /= Math.pow(0.95, scope.zoomSpeed);
			} else if (zoomDelta.y < 0) {
				scale *= Math.pow(0.95, scope.zoomSpeed);
			}

			zoomStart.copy(zoomEnd);
		} else if (state === STATE.PAN) {
			panEnd.set(event.clientX, event.clientY);
			panDelta.subVectors(panEnd, panStart);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		}

		scope.update();
	}

    function onMouseUp(event) {		// finishes the mouse motion capture
		document.removeEventListener("mousemove", onMouseMove, false);
		document.removeEventListener("mouseup", onMouseUp, false);

		state = STATE.NONE;
	}


    function onMouseWheel(event) {	// mouse wheel rotation capture
		if ((state === STATE.NONE) || (state === STATE.ROTATE)) {
			event.preventDefault();
			event.stopPropagation();

			if (event.deltaY < 0) {
				scale *= Math.pow(0.95, scope.zoomSpeed);
			} else if (event.deltaY > 0) {
				scale /= Math.pow(0.95, scope.zoomSpeed);
			}

			scope.update();
		}
	}


	function onTouchStart(event) {	// begins the touch capture
		if (event.touches.length === 1) {	// one-finger touch (rotate)
			rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
			state = STATE.TOUCH_ROTATE;
		} else if (event.touches.length === 2) {	// two-finger touch (zoom)
			var x = event.touches[0].pageX - event.touches[1].pageX;
			var y = event.touches[0].pageY - event.touches[1].pageY;
			zoomStart.set(0, Math.sqrt(x * x + y * y));
			state = STATE.TOUCH_ZOOM;
		} else if (event.touches.length === 3) {	// three-finger touch (pan)
			panStart.set(event.touches[0].pageX, event.touches[0].pageY);
			state = STATE.TOUCH_PAN;
		} else {
			state = STATE.NONE;
		}
	}

	function onTouchMove(event) {	// touch motion capture
		event.preventDefault();
		event.stopPropagation();

		if ((event.touches.length === 1) && (state === STATE.TOUCH_ROTATE)) {	// one-finger touch (rotate)
			rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
			rotateDelta.subVectors(rotateEnd, rotateStart);

			sphericalDelta.theta -= 2 * Math.PI * rotateDelta.x / renderer.clientWidth * scope.rotateSpeed;
			sphericalDelta.phi -= 2 * Math.PI * rotateDelta.y / renderer.clientHeight * scope.rotateSpeed;

			rotateStart.copy(rotateEnd);
		} else if ((event.touches.length === 2) && (state === STATE.TOUCH_ZOOM)) {	// two-finger touch (zoom)
			var x = event.touches[0].pageX - event.touches[1].pageX;
			var y = event.touches[0].pageY - event.touches[1].pageY;

			zoomEnd.set(0, Math.sqrt(x * x + y * y));
			zoomDelta.subVectors(zoomEnd, zoomStart);

			if (zoomDelta.y > 0) {
				scale *= Math.pow(0.95, scope.zoomSpeed);
			} else if (zoomDelta.y < 0) {
				scale /= Math.pow(0.95, scope.zoomSpeed);
			}

			zoomStart.copy(zoomEnd);
		} else if ((event.touches.length === 3) && (state === STATE.TOUCH_PAN)) {	// three-finger touch (pan)
			panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
			panDelta.subVectors(panEnd, panStart);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		} else {
			state = STATE.NONE;
		}

		scope.update();
	}

	function onTouchEnd(event) {	// finishes the touch motion capture
		state = STATE.NONE;
	}


	function onKeyDown(event) {		// keyboard shortcuts control
		switch (event.keyCode) {
			case scope.keyboardControls.ROTATEUP:sphericalDelta.phi -= scope.rotateSpeed/4;break;
			case scope.keyboardControls.ROTATEDOWN: sphericalDelta.phi += scope.rotateSpeed/4;break;
			case scope.keyboardControls.ROTATELEFT: sphericalDelta.theta -= scope.rotateSpeed/4;break;
			case scope.keyboardControls.ROTATERIGHT: sphericalDelta.theta += scope.rotateSpeed/4;break;

			case scope.keyboardControls.ZOOMIN: scale *= Math.pow(0.95, scope.zoomSpeed*2);break;
			case scope.keyboardControls.ZOOMOUT: scale /= Math.pow(0.95, scope.zoomSpeed*2);break;

			case scope.keyboardControls.PANUP: pan(0, -scope.panSpeed);break;
			case scope.keyboardControls.PANDOWN: pan(0, scope.panSpeed);break;
			case scope.keyboardControls.PANLEFT: pan(-scope.panSpeed, 0);break;
			case scope.keyboardControls.PANRIGHT: pan(scope.panSpeed, 0);break;
		}

		scope.update();
	}

	this.update();
};