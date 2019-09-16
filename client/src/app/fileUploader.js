"use strict";

$(function() {
	$(".navbar.top input[type='file'].fileUpload").change(function(e) {
		e.preventDefault();

		var file = $(this).get(0).files[0];
		
		if (file.size > 20000000) {	// 20.000.000 B = 20 MB
			showMessage("File too large (20 MB limit)", "red");
		} else if (!validateExt(file.name.substring(file.name.lastIndexOf(".")+1))) {
			showMessage("Extension not supported. You can use stl, ply, obj", "red");
		} else {
			var formData = new FormData();
			formData.append("file", file);

			$(".loadingBar.wrapper").fadeIn("fast");

			$.ajax({
				url: SERVER_URL+"/file",
				method: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function(res, status) {
					$(".loadingBar.wrapper").fadeOut("fast");

					$("canvas.particles-js-canvas-el").fadeOut("slow", () => {
                        $("canvas.particles-js-canvas-el").remove();
                        $("canvas.previewControl").css("display", "unset");
                    });

					showMessage("File uploaded successfully", "green");
					
                    window.controller3D.loadMesh(res);
				},
				error: function(jqXHR, status, err) {
					$(".loadingBar.wrapper").fadeOut("fast");
					
					if (!err) {
						showMessage("Unable to connect to server", "red");
					} else {
						showMessage(jqXHR.responseText, "red");
					}
				}
			});
		}
	});


	function validateExt(fileExt) {
		var validExt = ["stl", "ply", "obj"];

		for (let i=0; i<validExt.length; i++) {
			if (validExt[i] == fileExt.toLowerCase()) {
				return true;
			}
		}

		return false;
	}

	function showMessage(msj, color) {
		$(".stateMessage")
		.text(msj)
		.css({
			color: "white",
			background: color
		}).fadeIn("slow", function() {
			setTimeout(function() {
				$(".stateMessage").fadeOut("slow");
			}, 2000);
		});
	}
});