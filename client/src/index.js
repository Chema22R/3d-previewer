import * as projectIntro from "project-intro";
import "particles.js";

import "./assets/style/normalize.css";
import "./assets/style/index.css";
import "./assets/style/colorPicker.css";

import "./app/particles";
import "./app/colorPicker";
import "./app/orbitControls";
import "./app/3dControl";
import "./app/fileList";
import "./app/fileUploader";
import "./app/helpMenu";

window.projectIntro = projectIntro;
projectIntro.init();

document.body.style.opacity = "1";