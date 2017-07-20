/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-wireframe': '&#xe90b;',
		'icon-palette': '&#xe905;',
		'icon-help-circle': '&#xe904;',
		'icon-cloud-upload': '&#xe900;',
		'icon-arrow-right': '&#xe906;',
		'icon-right': '&#xe906;',
		'icon-next': '&#xe906;',
		'icon-arrow-left': '&#xe907;',
		'icon-left': '&#xe907;',
		'icon-previous': '&#xe907;',
		'icon-arrow-down': '&#xe908;',
		'icon-down': '&#xe908;',
		'icon-download': '&#xe908;',
		'icon-bottom': '&#xe908;',
		'icon-arrow-up': '&#xe909;',
		'icon-up': '&#xe909;',
		'icon-upload': '&#xe909;',
		'icon-top': '&#xe909;',
		'icon-home': '&#xe901;',
		'icon-reset': '&#xe901;',
		'icon-bin': '&#xe903;',
		'icon-trashcan': '&#xe903;',
		'icon-remove': '&#xe903;',
		'icon-delete': '&#xe903;',
		'icon-recycle': '&#xe903;',
		'icon-dispose': '&#xe903;',
		'icon-list': '&#xe902;',
		'icon-todo': '&#xe902;',
		'icon-bullet': '&#xe902;',
		'icon-menu': '&#xe902;',
		'icon-options': '&#xe902;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
