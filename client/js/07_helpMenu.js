$(function() {
    $(window).resize(function() {   // centers the help menu to the window size (on window resize)
		$(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").width()) / 2);
	});

    $(window).on("orientationchange", function() {   // centers the help menu to the window size (on orientation change)
        setTimeout(function() {
		    $(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").innerWidth()) / 2);
        }, 500);
	});

    $(".navbar.right .help.icon").click(function(e) {   // triggers the help menu
        e.preventDefault();
        $(".help.wrapper").fadeIn("slow");
        $(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").innerWidth()) / 2);

        setTimeout(function() {
            $(".help.content").scrollTop(0);
            $(".help.content").scrollLeft(0);
        }, 10);
    });

    $(".help.wrapper .help.leftover, .help.wrapper .help.menu .exitButton").on("mousedown touchstart", function(e) {   // closes the help menu
        e.preventDefault();
        $(".help.wrapper").fadeOut("slow");
    });
});