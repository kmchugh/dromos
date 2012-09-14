# dromos

> "in architecture, an entrance passage."

## What is dromos?
dromos is a JavaScript library which supports and encourages a modular js development approach which can help with faster, fluid and 
flexible development styles.

dromos is AMD compliant and can make use of Backbone, underscore, and jQuery.


## Usage
To use the dromos library, simply include it in you page as you would any other javascript:

> &lt;script src="dromos.bootstrap.js" type="text/javascript" charset="utf-8"&gt;&lt;/script&gt;

To preconfigure dromos, you can include a configuration object containing key-value pairs before the script is loaded:
> &lt;script type="text/javascript"&gt;
	require = {debug : true};
> &lt;/script&gt;

> &lt;script src="../dromos.bootstrap.js" type="text/javascript" charset="utf-8"&gt;&lt;/script&gt;


To configure or adjust the configuration of dromos after loading scripts you can call require.config :

	require.config({debug : true});

## Configuration options
* baseURI, *string*, Path to use as the base uri when determining the path of modules.  Defaults to the location of the dromos.Bootstrap.js file.
* debug, *boolean*, turns on or off debugging.  When debugging is on, console.debug will log to the console.
* paths, *object*, Key value pairs where the key is a module or module path, and the value is the path to use to load the module.
* version, *float*, version numbering, this is also used as a cache busting mechanism as it is appended to the url created when retrieving a resource.

# Loading a module
A module should be loaded using the require function, the require function takes an array of modules:

	require(["dromos.utilities", "myModuleDir/myModule", "../myOtherModuleDir/myOtherModule"]);

Any modules that have not been loaded already will then be loaded, modules that have already been loaded will not be loaded a second time.


Module Callbacks.  Any function passed as the second argument of require will be called only when
all of the modules defined are loaded.  If modules can not be loaded for any reason, the callback will not
be called.  Each parameter passed to the callback corresponds with the module that was required. e.g.:

	require(["dromos.utilities", "myModuleDir/myModule", "../myOtherModuleDir/myOtherModule"], 
	function(toUtilities, toMyModule, toOtherModule)
	{
		// This function be called when dromos.utilities, myModule, and myOtherModule are loaded
	});


It is also possible to load a single module by passing a string rather than an array e.g.:

	require("dromos.utilities");

It is also possible to call a module function inline:

	require('jquery').each(...);

And with callback:

	require("dromos.utilities", function(toUtilities)
	{
		// Do something with utilities
	});


If the module name has .js included then the path will *not* be determined using the Bootstraps paths settings:

	require("./myPage.Utilities.js", function(toUtilities)
	{
		// myPage.Utilities.js will load from the same location as the HTML it was referenced in
		// Do something with utilities
	});

## Defining modules and dependencies ##

A module can be defined using the define function.  define declares a modules dependencies as well as stating what the module is by way of a
function or object return type.

To define a function inline :

	define(
	{
		value : 1,
		text : "Some Text"
	});

This function defines an anonymous module which is simply an object with a value property equal to 1 and a text property containing "Some Text".
Modules can also have functions declared: 

	define(
	{
		value : 1,
		text : "Some Text"
		myFunction : function(){// Do something productive}
	});

The above anonymous module now also has a function called myFunction.

### Named Modules ###
A module can be named either by explicitly passing the name as a define parameter, or by placing the definition in a separate .js file and loading that
file using the require (or define) command.

An example of explicitly naming a module:

	define("myModule",
		{
			value : 1
		}
	);

The module "myModule" could now be accessed through the require command :

	alert(require("myModule").value);		// Alert the user with the value of myModule (1)

Loading a module from a javascript file:

	require("myModule");

	// Contents of myModule.js
	define(
	{
		value : 1
	});

In the above example the value of myModule would also be accessible through the require command

### Module Dependencies ###
You can create module dependencies by adding the list of dependencies to the require and define functions :

	require(["myModule", "myOtherModule"], function(toModule, toOtherModule)
	{
		alert(myModule.value + myOtherModule.getModuleValue());  // Alert box with the value 99
	})

	// Contents of myModule.js
	define(
	{
		value : 33;
	});

	// Contents of myOtherModule.js
	define(["myThirdModule"], function(toMyThirdModule)
	{
		var loValue = toMyThirdModule.getMyValue();
		return {
			value : 33,
			getModuleValue : function()
			{
				return this.value + toMyThirdModule.getMyValue();	// returns 66
			}
		};
	});

	// Contents of myThirdModule.js
	define(function()
	{
		return {
			getMyValue : fuction()
			{
				return 33;
			}
		}
	});

## Creating a bootstrap plugin

Plugins must be named dromos.Bootstrap.&lt;pluginName&gt;, and must be in the same directory as dromos.Bootstrap.js

A Plugin is used to alter how a resource is loaded.  

A plugin can be created by extending the dromos.Bootstrap.Plugin class, or any class the extends from the Plugin class.  e.g.:

	// dromos.Bootstrap.testPlugin.js file
	define(function(){

	    return new (dromos.Bootstrap.Plugin.extend(
	        {
	            onLoad : function(toModule)
	            {
	            	if (canLoad())
	            	{
	            		this.loadResource(toModule, dromos.Bootstrap.normaliseName(laResources[0]));
	            	}
	            	else
	            	{
	            		// Fallback to super
	            		this._load(toModule);
	            	}
	            }
	        }
	    ));
	});


The following methods are available for overriding:

* *onLoad(toModule)* - logic wrapping the loading of the resource, this should call loadResource if it is okay to load the specified module
* *loadResource(toModule, tcResource)* - loads the actual resource, by default loads a javascript file by calling addScriptTag
* *getResourceExtension* - gets the default extension for resources loaded by this plugin.  This will be used in creating url paths, defaults to '.js'
* *onResourceLoaded* - occurs when a resource load has been completed,  this event is linked during the call to addScriptTag, if your plugin does
not use addScriptTag, you will have to manually link up onResourceLoaded, no need to override if loading a js resource to a script tag
* *onResourceError* - occurs when a resource load could not be completed,  this event is linked during the call to addScriptTag, if your plugin does
not use addScriptTag, you will have to manually link up onResourceLoaded, no need to override if loading a js resource to a script tag
* *onError* - called by onResourceError(), allows custom error handling after Bootstrap error handling has occurred
* *onLoaded* - called by onResourceLoaded(), allows custom handling after Bootstrap handling has occurred


## Creating a dynamic plugin ##
Dynamic plugins are loaded when dromos is finished loading.  To mark an element as a dynamic plugin
simply add a dromos-module attribute to the element:

> &lt;div dromos-module="myModule"/&gt;

This will cause require to be called on myModule, attempting to load myModule and initialise the div element as a myModule plugin.

Plugins are created using the define function, an example of a plugin which used jquery:

	define(["jquery"], function($jQ)
	{
		myPlugin =
    		{
			init : function(toElement, toConfig, tnIndex)
			{
				// Initialise my plugin here
			}
	    	};
    		return myPlugin;
	});

Example of a plugin which creates a jquery widget:

	define(["jquery"], function($jQ)
	{
		$jQ.widget('dromos.ajaxLink',
		{
			_create : function()
			{
				// Initialise my widget
			}
		});

		dromos.ajaxLink =
		{
			init : function(toElement, toConfig, tnIndex)
			{
				console.error(toElement);
				$jQ(toElement).ajaxLink(toConfig);
			}
		};
	    	return dromos.ajaxLink;
	});

**Plugin Initialisation Function**

The plugin init function will be called by dromos and the parameters passed are:

* toElement - the html element that is being initialised as the plugin
* toConfig - configuration object for the plugin, or an empty object
* tnIndex - the index of this element in the list of elements that are being initialised as this specific plugin

By default the init function is called for initialisation, but this can be modified by supplying a 
dromos-init attribute:

> &lt;div dromos-module="myModule" dromos-init="myInitFunction"/&gt;

In the example above, the function myInitFunction would be called instead of init when initialising
the object, there is no change to the parameters

###Plugin Configuration Function###

The final configuration option is the ability to supply a configuration object to the plugin, this can
be achieved by adding a dromos-config attribute to the element:

	<script>
		myConfigFunction = function(){
			return {
				option1: value1,
				option2: value2
			};
		}
	</script>

	<div dromos-module="myModule" dromos-config="myConfigFunction"/>

This will cause dromos to attempt to use the value retrieved from the myConfigFunction when calling the initialisation function.


### Accessing jquery, underscore, or backbone ###
jquery, underscore, or backbone can be accessed either by including in a define or require e.g.:

	require(["underscore", "jquery", "backbone"], function($_, $jQ, $bb)  
	{
		// Underscore can now be accessed through the $_ variable
		// Backbone can now be accessed through the $bb variable
		// jQuery can now be accessed through the $jQ variable
	});


or they can be accessed without including in require or define by accessing from the dromos namespace e.g.:

	dromos._   // Underscore  
	dromos.$bb // Backbone  
	dromos.$jQ // jQuery  

While this is possible, it is not reccomended as the require and define are used to make it clear what is required for a specific module.
 