"use strict";

$(function() {
    const projectIntroText =    "This applications is a 3D object previewer that allows users to interact and carry out certain basic" +
                                " operations on loaded objects, enabling their analysis in detail.<br>In addition, the application" +
                                " stores the extracted and processed geometry of the objects, so that they can be easily loaded" +
                                " again.<br>The main interface has two buttons:<br>&nbsp;&#8226; The upper right button allows the user to load" +
                                " STL, OBJ or PLY files to process them on the server and display them on the interface.<br>&nbsp;&#8226; The" +
                                " upper left button displays a list of the files processed and stored in the server, allowing the user to" +
                                " request the stored geometry.<br>Once the 3D object is displayed in the interface, the user can perform" +
                                " basic operations such as rotation, padding or zooming.";

    $("<p>" + projectIntroText + "</p>").appendTo("#projectIntroText");

    $(window).on("click touchstart", function(e) {
        if ($("#projectIntroContainer").is(":visible") && ($(e.target).is("#projectIntroContainer, #projectIntroBack, #projectIntroExit"))) {
            $("#projectIntroContainer").fadeOut("slow");
        }
    });
});