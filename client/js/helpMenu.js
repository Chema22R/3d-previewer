"use strict";

function helpMenuFadeIn() {
    document.getElementById("helpMenu").style.display = "flex";
    document.getElementById("helpMenuTextL").scrollTop = 0;
    document.getElementById("helpMenuTextR").scrollTop = 0;
    setTimeout(() => {
        document.getElementById("helpMenu").style.opacity = 1;
    }, 50);
}

function helpMenuFadeOut() {
    document.getElementById("helpMenu").style.opacity = 0;
    setTimeout(() => {
        document.getElementById("helpMenu").style.display = "none";
    }, 500);
}