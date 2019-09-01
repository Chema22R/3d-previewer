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
		'icon-quit': '&#x2715;',
		'icon-wireframe': '&#x1f310;',
		'icon-palette': '&#x1f308;',
		'icon-help-circle': '&#x275f;',
		'icon-cloud-upload': '&#x2601;',
		'icon-arrow-right': '&#x27a1;',
		'icon-right': '&#x27a1;',
		'icon-next': '&#x27a1;',
		'icon-arrow-left': '&#x2b05;',
		'icon-left': '&#x2b05;',
		'icon-previous': '&#x2b05;',
		'icon-arrow-down': '&#x2b07;',
		'icon-down': '&#x2b07;',
		'icon-download': '&#x2b07;',
		'icon-bottom': '&#x2b07;',
		'icon-arrow-up': '&#x2b06;',
		'icon-up': '&#x2b06;',
		'icon-upload': '&#x2b06;',
		'icon-top': '&#x2b06;',
		'icon-home': '&#x1f3e0;',
		'icon-reset': '&#x1f3e0;',
		'icon-bin': '&#x267b;',
		'icon-trashcan': '&#x267b;',
		'icon-remove': '&#x267b;',
		'icon-delete': '&#x267b;',
		'icon-recycle': '&#x267b;',
		'icon-dispose': '&#x267b;',
		'icon-list': '&#x2630;',
		'icon-todo': '&#x2630;',
		'icon-bullet': '&#x2630;',
		'icon-menu': '&#x2630;',
		'icon-options': '&#x2630;',
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
