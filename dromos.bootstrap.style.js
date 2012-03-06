/*====================================
Style plugin for dromos bootstrap.

This plugin will load any css or less file indicated and attach them to the dom.
====================================*/
define(["jquery", "dromos.utilities"],function($jQ, utilities){
    return new (dromos.Bootstrap.Plugin.extend(
        {
            /***
             * Adds the script tag to the page
             */
            addScriptTag : function(toModule)
            {
                if (/.(le|c)ss($|\?)/i.test(lcModule) && !toModule.isComposition() && !toModule.getTag())
                {
                    var lcURL = toModule.getURL();
                    g_oBase.console.debug("Adding style for " + toModule.getName() + " ("+ lcURL + ")");
                    // Make sure we are ready
                    var loTag = utilities.createElement("link");
                    loTag.href = lcURL;
                    loTag.type = "text/css";
                    loTag.charset = "utf-8";
                    loTag.rel = "stylesheet";
                    loTag.module = toModule;
                    toModule.setTag(loTag);
                    g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptLoaded, typeof(loTag.readyState) != 'undefined' ? "readystatechange" : "load");
                    g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptError, "error");
                    document.getElementsByTagName("head")[0].appendChild(loTag);
                }
                else
                {
                    this.onError(toModule);
                }
            }
        }
    ));
});