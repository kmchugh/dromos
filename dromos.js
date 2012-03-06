/*=============================
dromos javascript library core.

This class is loaded by the dromos Bootstrap and should not
be included directly in a page


=============================*/
define(["jquery", "dromos.utilities"], function($jQ, utilities)
{
	// Variables for handling plugins
	var __DROMOS_PLUGIN__ = "dromos-module";
	var __DROMOS_INIT__ = "dromos-init";
	var __DROMOS_CONFIG__ = "dromos-config";

	// Make sure dromos exists, it should exist as normally this would be loaded by the bootstrap
	dromos = dromos || {};

	// As dromos already exists and has functions defined, we create this 
	// piece by piece rather than as a single object

	/**
	* Creates and returns a namespace from tcNamespace
	* if tcDelimiter is defined it will be used to separate the namespaces,
	* otherwise the default delimiter is '.'
	*/
	dromos.namespace = function(tcNamespace, tcDelimiter)
	{
		var laParts = tcNamespace.split(tcDelimiter || '.');
		dromos.base[laParts[0]] = dromos.base[laParts[0]] || {};
        var loCurrent = dromos.base[laParts[0]];
        for (var i=1, lnLength=laParts.length; i<lnLength; i++)
        {
            loCurrent = loCurrent[laParts[i]] || {};
        }
        return loCurrent;
	};

	// Iniitialises any modules that are round in toElement, if toElement is not provided, this searched the document
	dromos.initialiseModules = function(toElement)
	{
		toElement = $jQ(toElement || document);
		toElement.find("[" + __DROMOS_PLUGIN__ + "]").each(function(tnIndex, toElement)
		{
			toElement = $jQ(toElement);
			require(toElement.attr(__DROMOS_PLUGIN__), function(toModule)
            {
                utilities.initialiseModule(toModule, toElement, tnIndex, toElement.attr(__DROMOS_INIT__), dromos.base[toElement.attr(__DROMOS_CONFIG__)]);
            });
            // Remove the attribute so that we don't initialise again
			toElement.removeAttr(__DROMOS_PLUGIN__);
            
        });
	};



	// Initialise any plugins that exist on the page at this time
	dromos.initialiseModules();

	// return the dromos object for future require calls
	return dromos;
});

