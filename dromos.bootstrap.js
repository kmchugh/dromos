/*=============================
dromos javascript bootstrap.

This class should be included
in any page that needs access 
to the dromos functionality.
=============================*/

// Update the console to ensure support for IE
console = {
	// Member variable storing the console that exists
	m_oConsole : console || log : function(){}, error: function(){}},
	log : function(tcMessage){this.m_oConsole.log(tcMessage);},
	debug : function(tcMessage){this.m_oConsole.log(tcMessage);},
	error : function(tcMessage){this.m_oConsole.error(tcMessage);}
}

// dromos bootstrap
(function(toBase){
	var __VERSION__ = 0.1; // Version number, used in .js urls, so cache busting can be done by changing
	var __DEBUG__ = false; // debug mode.  Can be configured by calling require.config({debug : true});
	var __ROOT__ = "/resources/inc/javascript/"; // root url when looking for .js files
	var g_oBase = toBase;  // usually reference to the window or server object
	


	// Default configuration
	require.config({
		version : __VERSION__,
		debug : __DEBUG__,
		baseUrl : __ROOT__,
		paths : {
			"underscore" : __ROOT__ + "lib/underscore.js?minify=false",
			"backbone" : __ROOT__ + "lib/backbone-min.js?minify=false",
			"jquery" : __ROOT__ + "lib/jquery.min.js?minify=false;"
		},
		lockException : ["jquery", "backbone", "underscore"]
	});

})(this);