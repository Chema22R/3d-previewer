$(function() {
	$(".navbar.top input[type='file'].fileUpload").change(function(e) {
		e.preventDefault();

		var file = $(this).get(0).files[0];
		
		if (validateExt(file.name.substring(file.name.lastIndexOf(".")+1))) {
			var formData = new FormData();
			formData.append("file", file);

			$(".loadingBar.wrapper").fadeIn("slow");

			$.ajax({
				url: "http://"+serverAddress+":"+serverPort+"/api/file",
				method: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function(res, status) {
					$(".loadingBar.wrapper").fadeOut("slow");

					showMessage("File uploaded successfully", "green");
					
                    controller3D.loadMesh(res);
				},
				error: function(jqXHR, status, err) {
					$(".loadingBar.wrapper").fadeOut("slow");
					
					if (!err) {
						showMessage("Unable to connect to server", "red");
					} else {
						showMessage(jqXHR.responseText, "red");
					}
				}
			});
		} else {
			showMessage("Extension not supported. You can use stl, ply, obj", "red");
		}
	});


	function validateExt(fileExt) {
		var validExt = ["stl", "ply", "obj"];

		for (i=0; i<validExt.length; i++) {
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