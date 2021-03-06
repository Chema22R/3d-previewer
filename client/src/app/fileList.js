"use strict";

$(function() {
    /* File List Menu
    ========================================================================== */

    $(".navbar.top .fileList.icon").click(function(e) {
        e.preventDefault();

        $(".loadingBar.wrapper").fadeIn("fast");

        getFileList(0);
    });

    function getFileList(attempts) {
        $.ajax({
            url: SERVER_URL+"/file",
            method: "GET",
            success: function(res, status) {
                if (res.length === 0 && attempts < 2) {
                    setTimeout(() => {
                        getFileList(++attempts);
                    }, 1000);
                } else {
                    entriesGenerator(res);
                }
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

    function entriesGenerator(res) {
        if (res.length == 0) {
            $(".fileList.entries").css({"padding": "30px 0", "text-align": "center"}).text("No items to display");
        } else {
            $(".fileList.entries").css({"padding": "0", "text-align": "unset"});

            for (var i=0; i<res.length; i++) {
                $("<div class='" + res[i]._id + " fileList entry'>" +
                    "<div class='" + res[i]._id + " fileList info pointer' title='" + res[i].name + "'>" +
                        "<p class='fileList name'>" + res[i].name + "</p>" +
                        "<p class='fileList date'>" + new Date(res[i].date).toLocaleString() + "</p>" +
                    "</div>" +
                    "<span class='" + res[i]._id + " fileList icon-delete pointer' title='delete " + res[i].name + "'></span>" +
                "</div>")
                .appendTo(".fileList.entries");
            }
        }

        $(".loadingBar.wrapper").fadeOut("fast");
        $(".fileList.menu").fadeIn("slow");

        setTimeout(() => {
            $(".fileList.menu").scrollTop(0);
            delayedLoad();
        }, 10);
    }


    /* Event handlers
    ========================================================================== */

    // to detect clicks (mousedown) outside the file list and close it
    $(window).on("mousedown touchstart", function(e) {
        if ((!$(e.target).is(".fileList")) && ($(".fileList.menu").css("display") != "none")) {
            var entries = $(".fileList.entries")[0];
            
            $(".fileList.menu").fadeOut("slow", function() {
                while (entries.childNodes.length > 0) {
                    entries.childNodes[0].remove();
                }

                $(".fileList.menu .fileList.search").val("");
            });
        }
    });

    // search field functionality
    $(".fileList.menu .fileList.search").on("input propertychange change", function(e) {
        e.preventDefault();
        
        var search = $(this).val().toLowerCase().trim();

        $(".fileList.name").html(function(index, name) {
            if (name.toLowerCase().includes(search)) {
                $(this).parent().parent().show();
            } else {
                $(this).parent().parent().hide();
            }
        });

        $(".fileList.date").html(function(index, date) {
            if (date.toLowerCase().includes(search)) {
                $(this).parent().parent().show();
            }
        });
    });


    // functions to load just after the file list is filled
    function delayedLoad() {
        // functionality to execute when an object of the file list is selected
        $(".fileList.menu .fileList.info").click(function(e) {
            e.preventDefault();

            var id = $(this).attr("class").split(" ")[0];
            var entries = this.parentNode.parentNode;

			$(".loadingBar.wrapper").fadeIn("fast");
            
            $.ajax({
                url: SERVER_URL+"/file/" + id,
                method: "GET",
                success: function(res, status) {
                    $(".loadingBar.wrapper").fadeOut("fast");

                    $(".fileList.menu, canvas.particles-js-canvas-el").fadeOut("slow", () => {
                        $("canvas.particles-js-canvas-el").remove();
                        $("canvas.previewControl").css("display", "unset");

                        while (entries.childNodes.length > 0) {
                            entries.childNodes[0].remove();
                        }

                        $(".fileList.menu .fileList.search").val("");
                    });

                    if (typeof res == "object") {
                        window.controller3D.loadMesh(res);
                    } else {
                        showMessage("File no longer exists", "red");
                    }
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
        });


        // functionality to execute when the delete button of an object of the file list is clicked
        $(".fileList.menu .fileList.icon-delete").click(function(e) {
            e.preventDefault();

            var id = $(this).attr("class").split(" ")[0];
            var entry = this.parentNode;

            $(".loadingBar.wrapper").fadeIn("fast");
            
            $.ajax({
                url: SERVER_URL+"/file/" + id,
                method: "DELETE",
                success: function(res, status) {
                    $(".loadingBar.wrapper").fadeOut("fast");
                    $(entry).hide(400, "linear", function() {
                        if (entry.parentNode.childNodes.length === 1) {
                            $(".fileList.entries").css({"padding": "30px 0", "text-align": "center"}).text("No items to display");
                        }
                        entry.remove();
                    });
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
        });
    }


    function showMessage(msj, color) {
		$(".stateMessage")
		.text(msj)
		.css({
			color: "white",
			background: color
		}).fadeIn("slow", function() {
			setTimeout(function() {
				$(".stateMessage").fadeOut("slow");
			}, 2000);
		});
	}
});