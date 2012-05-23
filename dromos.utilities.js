/*=============================
dromos javascript library utilities.

This contains helper functions used by the dromos libraries
=============================*/
define(["jquery"],
	function($jQ)
{

	/*********************
     * UPDATE THE STRING PROTOTYPE
     *********************/
    /**
     * Pads the string on the left using the character provided, ensures the string is
     * no longer than tnFinal length after padding.
     */
    String.prototype.padLeft = function(tcPadPattern, tnFinalLength)
    {
        var loRE = new RegExp(".{" + tnFinalLength + "}$");
        var lcPadding = "";
        do
        {
            lcPadding += tcPadPattern;
        } while(lcPadding.length < tnFinalLength);
        return loRE.exec(lcPadding + this);
    }
    
    /**
     * Pads the string on the right using the character provided, ensures the string is
     * no longer than tnFinal length after padding.
     */
    String.prototype.padRight = function(tcPadPattern, tnFinalLength)
    {
        var loRE = new RegExp("^.{" + tnFinalLength + "}");
        var lcPadding = "";
        do
        {
            lcPadding += tcPadPattern;
        } while(lcPadding.length < tnFinalLength);
        return loRE.exec(lcPadding + this);
    }
    
    /**
     * Trims all white space from the front of the string
     */
    String.prototype.lTrim = function()
    {
        return this.replace(/^\s+/, '');
    }
    /**
     * Trims all white space from the back of the string
     */
    String.prototype.rTrim = function()
    {
        return this.replace(/\s+$/, '');
    }
    /**
     * Trims all white space from both sides of the string
     */
    String.prototype.allTrim = function()
    {
        return this.replace(/^\s+|\s+$/g, '');
    }

    // Dromos utilities object
	dromos.utilities = {
		// Checks if the object is of the type specified.
        isType : function(toObject, tcType)
            {return Object.prototype.toString.call(toObject) === ("[object " + tcType + "]");},

        // Extracts the script tag from the first script tag with a src containing tcScript
        getScript : function(tcScript)
        {
        	// TODO: Test with paramaterised scripts
        	// TODO: Test with namespaced scripts (e.g. dromos dromos.utilities)
        	var laScripts = document.getElementsByTagName("script");
        	var loRegEx = new RegExp(".+?"+ tcScript, "i");
        	for (var i=0, lnLength = laScripts.length; i<lnLength; i++)
        	{
        		if (loRegEx.test(laScripts[i].src))
        		{
        			return laScripts[i];
        		}
        	}
        	return null;
        },

        // Returns true if the element passed is attached to the document
        isAttachedToDom : function(toElement)
        {
            var loAncestor = toElement;
            while(loAncestor.parentNode)
            {
                loAncestor = loAncestor.parentNode;
            }
            return !!(loAncestor.body);

        },

        // Adds an event listener to the element specified
        addEventListener : (function(){
            return window.addEventListener ?
                function(toElement, toCallback, tcEventType)
                {
                    toElement['_'+tcEventType+'Handler'] = toElement['_'+tcEventType+'Handler'] || {};
                    toElement['_'+tcEventType+'Handler'][toCallback.toString()] = toElement['_'+tcEventType+'Handler'][toCallback] || function(e){toCallback(e)};
                    toElement.addEventListener(tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()], false);
                } :
                function(toElement, toCallback, tcEventType)
                {
                    toElement['_'+tcEventType+'Handler'] = toElement['_'+tcEventType+'Handler'] || {};
                    toElement['_'+tcEventType+'Handler'][toCallback.toString()] = toElement['_'+tcEventType+'Handler'][toCallback] || function(e){toCallback(window.event)};
                    toElement.attachEvent("on" + tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()]);
                };
        })(),
        // Removes an event listener from the element specified
        // TODO: ensure this is removing the event
        removeEventListener : (function(){
            return window.removeEventListener ?
                function(toElement, toCallback, tcEventType)
                {
                    toElement.removeEventListener(tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()], false);
                    delete toElement['_'+tcEventType+'Handler'][toCallback.toString()];
                } :
                function(toElement, toCallback, tcEventType)
                {
                    toElement.detachEvent("on" + tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()]);
                    delete toElement['_'+tcEventType+'Handler'][toCallback.toString()];
                };

        })(),

        // Takes a URL and "Cleans" it by adding to the url, the default is to add the version from cachebuster
        cleanURL : function(tcURL)
            {return tcURL + (tcURL.indexOf("?") < 0 ? "?" : "&") + "version=" + dromos.Bootstrap["version"];},
        /**
         * Initialises toModule by calling toInitFunction(init by default) passing the
         * element and index of the element in the list of module elements.  toModule should already be loaded
         * for this call. toInitConfig can be configuration options, or a function
         * that returns configuration options, if it exists, the options will be passed to the
         * init function as well
         */
        initialiseModule : function(toModule, toElement, tnIndex, toInitFunction, toInitConfig)
        {
            toInitFunction = toInitFunction || "init";
            toInitConfig = this.isType(toInitConfig, "Function") ? toInitConfig.call(null, toElement) : toInitConfig || {};
            if (toModule && toModule[toInitFunction])
            {
                toModule[toInitFunction].apply(toModule, [toElement, toInitConfig, tnIndex]);
            };
        },
        // Creates an element using the namespace if possible
        createElement : (function(){
        	return document.createElementNS ?
        		function(tcTagName){return (dromos.utilities.createElement[tcTagName] = dromos.utilities.createElement[tcTagName] || document.createElementNS( 'http://www.w3.org/1999/xhtml', tcTagName)).cloneNode(false);} :
        		function(tcTagName){return (dromos.utilities.createElement[tcTagName] = dromos.utilities.createElement[tcTagName] || document.createElement(tcTagName)).cloneNode(false);};
        })(),
        // Creates a callback function which will call toMethod on toTarget and return the result.
        createCallback : function(toMethod, toTarget){return function(){toMethod.apply(toTarget, arguments);}}
	};
	return dromos.utilities;
});