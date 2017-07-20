
$(function() {
    $(window).resize(function() {   // centers the help menu to the window size (on window resize)
		$(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").width()) / 2);
	});

    $(window).on("orientationchange", function() {   // centers the help menu to the window size (on orientation change)
        setTimeout(function() {
		    $(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").width()) / 2);
        }, 500);
	});

    $(".navbar.right .help.icon").click(function(e) {   // triggers the help menu
        e.preventDefault();
        $(".help.wrapper").fadeIn("slow");
        $(".help.wrapper .help.menu").css("left", (window.innerWidth - $(".help.wrapper .help.menu").width()) / 2);
    });

    $(".help.wrapper .help.leftover").on("mousedown touchstart", function(e) {   // closes the help menu
        e.preventDefault();
        $(".help.wrapper").fadeOut("slow");
    });
});