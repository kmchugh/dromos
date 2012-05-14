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

	dromos.addDOMNotifier = function(tnIndex, toElement)
	{
		var loFNBefore = toElement.insertBefore;
		toElement.insertBefore = function()
		{
			var loReturn = loFNBefore.apply(this, arguments);
			if (loReturn != null && $jQ(loReturn).parents(document).length >0)
			{
				dromos.addDOMNotifier(0, loReturn);
				$jQ(this).trigger('domchildadded');
			}
			return loReturn;
		}
		
		var loFNAppend = toElement.appendChild;
		toElement.appendChild = function()
		{
			var loReturn = loFNAppend.apply(this, arguments);
			if (loReturn != null && $jQ(loReturn).parents(document).length >0)
			{
				dromos.addDOMNotifier(0, loReturn);
				$jQ(this).trigger('domchildadded');
			}
			return loReturn;
		}
	}


	// Update all elements to notify of dom changes
	$jQ('*').each(dromos.addDOMNotifier);
	$jQ('*').on('domchildadded', function()
			{
				$jQ(this).find("[" + __DROMOS_PLUGIN__ + "]").each(function(tnIndex, toElement)
				{
					var loElement = $jQ(toElement);
					var lcModule = loElement.attr(__DROMOS_PLUGIN__);
					if (lcModule)
					{
						var lcInit = loElement.attr(__DROMOS_INIT__);
						var lcConfig = loElement.attr(__DROMOS_CONFIG__);
						loElement.removeAttr(__DROMOS_PLUGIN__).removeAttr(__DROMOS_INIT__).removeAttr(__DROMOS_CONFIG__);
						require(lcModule, function(toModule)
							{
								dromos.utilities.initialiseModule(toModule, toElement, tnIndex, lcInit, dromos.base[lcConfig]);
							});
					}
				});
		});

	// return the dromos object for future require calls
	return dromos;
});
