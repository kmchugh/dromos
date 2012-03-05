# dromos

"in architecture, an entrance passage."

## What is dromos?
dromos is javascript library that is AMD compliant which allows simple access to the Lintel back end.
dromos makes use of Backbone, underscore, and jQuery.

## Usage
To use the dromos library, simply include it in you page as you would any other javascript:
&lt;script src="dromos.bootstrap.js" type="text/javascript" charset="utf-8"&gt;&lt;/script&gt;

To preconfigure dromos, you can include a configuration object before the script is loaded:
&lt;script type="text/javascript"&gt;
	require = {debug : true};
&lt;/script&gt;
&lt;script src="../dromos.bootstrap.js" type="text/javascript" charset="utf-8"&gt;&lt;/script&gt;

To configure dromos after loading you can call require.config :
require.config({debug : true});

## Configuration options
* debug, boolean, turns on or off debugging.  When debugging is on, console.debug will log to the console.
* version, float, version numbering, this is also used as a cachebusting mechanism as it is part of the url created when retrieving a file.
*  root, string (path relative or absolute), the root to use when loading files, if not specified will be based on the location of the dromos.bootstrap file.
*  paths, array of key value pairs representing a module and the module url

# Loading a module
A module should be loaded using the require function, the require function takes an array of module paths
which cn be absolute or relative based on the root directory:
require(["dromos.utilities", "myModuleDir/myModule", "../myOtherModuleDir/myOtherModule"]);

Any modules that have not been loaded already will then be loaded, modules that have already been loaded will not be loaded a second time.


Module Callbacks.  Any function passed as the second argument of require will be called only when
all of the modules defined are loaded.  If modules can not be loaded for any reason, the callback will not
be called.  Each parameter passed to the callback corresponds with the module that was required. e.g.:
require(["dromos.utilities", "myModuleDir/myModule", "../myOtherModuleDir/myOtherModule"], 
	function(toUtilities, toMyModule, toOtherModule)
	{
		// Do something relevent here!
	});

It is also possible to load a single module by passing a string rather than an array e.g.:
require("dromos.utilities");

And with callback:
require("dromos.utilities", function(toUtilities)
	{
		// Do something with utilities
	});

If the module name has .js included then relative paths will be from the document location rather than from the default root. e.g. :
require("./myPage.Utilities.js", function(toUtilities)
	{
		// Do something with utilities
	});

## Creating a plugin

Plugins must be named dromos.Bootstrap.&lt;pluginName&gt;, and must be in the same directory as dromos.Bootstrap.js

A plugin can be created by extending the dromos.Bootstrap.Plugin class, or any class the extends from the Plugin class.  e.g.:

// dromos.Bootstrap.testPlugin.js file
define(function(){

    return new (dromos.Bootstrap.Plugin.extend(
        {
            load : function(toModule)
            {
            	// Do something spectacular

            	// Call the superclass load
            	this._load(toModule);
            }
        }
    ));
});


The following methods are available for overriding:

* load - intended to load the module.  Called when a module is required/defined, but not yet loaded
* addScriptTag - intended to add a tag to the document body, normally this would cause the .js to load
* onScriptError - occurs when there is an error loading the script, event driven from the script tag
* onScriptLoaded - occurs when the script completes its load, event driven from the script readystatechanged
* resolveDefinition - used to change a definition from data to a usable value, what is returned from this method will be used when the module is loaded in subsequent require or define statements 
* onError - called from onScriptError, usually this should be overridden instead of onScriptError
* onComplete - called when a module notifies us that it has completed loading 


## Accessing jquery, underscore, or backbone
jQuery, underscore, or backbone can be accessed either by including in a define or require e.g.:
require(["underscore"], function(_)
{
	// do something with underscore using the '_' variable name.
});

or they can be accessed without including in require or define by accessing from the dromos namespace e.g.:
dromos._   // Underscore
dromos.$bb // Backbone
dromos.$jQ // jQuery

While this is possible, it is not reccomended as the require and define are used to make it clear what is required for a specific module.
 