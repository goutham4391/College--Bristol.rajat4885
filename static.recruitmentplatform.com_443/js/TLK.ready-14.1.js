(function($) {
	window.TLK = window.TLK || {};
	window.TLK.$ = $;
	TLK.ready = function(fn, initialcount) {
		if(typeof fn == "function") TLK.ready.vars.functions.push(fn);
		if(typeof initialcount != "undefined") TLK.ready.vars.initialcount = initialcount; 
		if(!TLK.ready.vars.checking) {
			TLK.ready.vars.checking = true;
			TLK.$(document).ready(function() {
				TLK.ready.vars.run();
			});
		}
	}
	TLK.ready.vars = {
		functions: [],
		checking: false,
		ready: false,
		count: 0,
		max: 100,
		initialcount: 0,
		run: function() {
			var elem = TLK.$("> *", ".PSOFOShop").not("script, noscript");
			if(elem.length <= TLK.ready.vars.initialcount && ++TLK.ready.vars.count <= TLK.ready.vars.max) {
				setTimeout("TLK.ready.vars.run()", 25);
				return;
			}
			TLK.$(TLK.ready.vars.functions).each(function(a, b) {
				b.call();
			});
		}
	}
})(jQuery);