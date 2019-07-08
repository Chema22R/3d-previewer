"use strict";

window.helpMenu.fadeIn = () => {
    document.getElementById("helpMenu").style.display = "flex";
    document.getElementById("helpMenuTextL").scrollTop = 0;
    document.getElementById("helpMenuTextR").scrollTop = 0;
    setTimeout(() => {
        document.getElementById("helpMenu").style.opacity = 1;
    }, 50);
}

window.helpMenu.fadeOut = () => {
    document.getElementById("helpMenu").style.opacity = 0;
    setTimeout(() => {
        document.getElementById("helpMenu").style.display = "none";
    }, 500);
}