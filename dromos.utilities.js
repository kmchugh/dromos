/*=============================
dromos javascript library utilities.

This contains helper functions used by the dromos libraries
=============================*/
define(['jquery'],
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

    /**
     * Functions for allowing animation of background opacity
     */
    var loRgba = /^rgba\((\d+),\s*(\d+),\s*(\d+)\,\s*(\d+(\.\d+)?)\)$/;
    var loRgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;

    function getRgbaColorValue(toElement)
    {
        var loBackground = dromos.$jQ.css(toElement, 'background-color');
        return (loBackground.indexOf('rgba') !== -1) ?
            loRgba.exec(loBackground) :
            loRgb.exec(loBackground);
    };

    dromos.$jQ.cssNumber.backgroundColorAlpha = true;
    dromos.$jQ.cssHooks.backgroundColorAlpha =
    {
        get: function(toElement)
        {
            var laReturn = getRgbaColorValue(toElement);
            return laReturn.length >= 4 ? laReturn[4] : 1;
        },
        set: function(toElement, tnValue)
        {
            var laColour = getRgbaColorValue(toElement);
            toElement.style.backgroundColor = 'rgba(' + laColour[1] + ',' + laColour[2] + ',' + laColour[3] + ',' + tnValue + ')';
        }
    };

    dromos.$jQ.fx.step.backgroundColorAlpha = function(toFX)
    {
        dromos.$jQ.cssHooks.backgroundColorAlpha.set(toFX.elem, toFX.now + toFX.unit);
    };


    // Dromos utilities object
	dromos.utilities = {

        /**
             * Gets the attribute specified on the element specified
             * @param  Element toElement the element to get the attribute value from
             * @param  String tcAttribute the name of the attribte to get the value of
             * @return the value of the attribute  or null if the attribute did not exist on the element
             */
            getAttribute : function(toElement, tcAttribute)
            {
                if (toElement[tcAttribute] !== undefined)
                {
                    return toElement[tcAttribute];
                }
                else if (toElement.getAttribute)
                {
                    return toElement.getAttribute(tcAttribute);
                }
                else if (toElement.attributes && toElement.attributes[tcAttribute])
                {
                    return toElement.attributes[tcAttribute];
                }
                return null;
            },
            
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

        // Popup related functionallity
        popup : {
            popups : {},
            lastSettings : {
                'location': 'no',
                'status': 'no',
                'titlebar': 'no',
                'toolbar': 'no',
                'menubar': 'no',
                'directories': 'no',
                'resizable': 'no',
                'scrollbars': 'no',
                'width': '250',
                'height': '250'
            },

            // Checks if the current window has been opened by javascript, if so returns true
            isPopup : function(){return !!window.opener;},
            // Gets the specified popup if it exists, or null
            get : function(tcID){return this.popups[tcID] ? this.popups[tcID] : null;},
            // Closes the specified popup, no op if no popup is found
            close : function(tcID)
            {
                var loPopup = this.get(tcID);
                if (loPopup != null)
                {
                    loPopup.close();
                    this.popups[tcID] = null;
                }
            },
            /**
            * Pops up a window for the user and returns a reference to that window.
            * if the popup is blocked then the user will be asked to disable their blocker and 
            * try again.
            * tcURL - the url to open
            * tcID - the identity of the popup, if none is given a default will be used
            * toOptions - the options to use for the window
            * tlUseBlank - if the user has a popup blocker and the window is blocked, use _blank instead
            **/
            open : function(tcURL, tcID, toOptions, tlUseBlank)
            {
                // Prepare any defaults
                if (!tcURL){tcURL = "";}
                if (!tcID){tcID = "default";}

                // Merge the options with the default options
                var loDefaults = this.lastSettings;
                if (toOptions)
                {
                    for (var loProp in toOptions)
                    {
                         loDefaults[loProp] = toOptions[loProp];
                    }
                }
                // Close previously opened popup
                this.close(tcID);

                // Create the popup string
                var lcPopup = "";
                for (var lcProp in loDefaults)
                {
                    lcPopup += lcProp + '=' + loDefaults[lcProp] + ',';
                }
                var loPopup = window.open(tcURL, tcID, lcPopup.substring(0, lcPopup.length-1));
                if (loPopup)
                {
                    if (window.focus)
                    {
                        loPopup.focus();
                        this.popups[tcID] = loPopup;
                        return loPopup;
                    }
                }
                else if (tlUseBlank)
                {
                    // Open the URL as a link with a blank target
                    // TODO: Implement this
                    alert('Please disable your pop-up blocker and try again.');
                }
                else
                {
                    alert('Please disable your pop-up blocker and try again.');
                }
                return null;
            }
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

        
        /**
        * Uses bit.ly to shorten the URL provided
        **/
        shortenURL : function(tcURL, tcUser, tcApiKey, tcCallback)
        {
            $jQ.getJSON("http://api.bitly.com/v3/shorten?callback=?",
                {
                    "format": "json",
                    "apiKey": tcApiKey,
                    "login": tcUser,
                    "longUrl": encodeURI(tcUrl)

                }, function(toResponse){toCallback(toResponse.data.url);});
        },
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
        createCallback : function(toMethod, toTarget){return function(){return toMethod.apply(toTarget, arguments);}}
	};
	return dromos.utilities;
});