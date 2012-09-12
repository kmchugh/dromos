/*====================================
Ordering plugin for dromos bootstrap.

This plugin will load any modules indicated in the order they are presented.

    require(["dromos.utilities", "order!myModuleDir/myModule", "order!../myOtherModuleDir/myOtherModule"], 
    function(toUtilities, toMyModule, toOtherModule)
    {
        // Do something relevent here!
    });

will ensure that myModule is loaded before myOtherModule

This plugin supports mixed ordering

    require(["dromos.utilities", "order!myModuleDir/myModule", "yetAnotherModule", "order!../myOtherModuleDir/myOtherModule"], 
    function(toUtilities, toMyModule, toAnotherModule, toOtherModule)
    {
        // Do something relevent here!
    });

will ensure that myModule is loaded before myOtherModule, yetAnotherModule could be loaded at any time.
====================================*/
define(function(){

    var m_aLoading = [];

    return new (dromos.Bootstrap.Plugin.extend(
        {
            onLoad : function(toModule)
            {
                console.debug("Load module " + toModule.getName() + " with order plugin");
                if (m_aLoading.indexOf(toModule.getName()) < 0)
                {
                    m_aLoading.push(toModule.getName());
                }
                // If this is the top module on the list, start to load it
                if (m_aLoading[0] === toModule.getName())
                {
                    this.startLoad(toModule);
                }
            },
            startLoad : function(toModule)
            {
                var laResources = toModule.getResources();
                if (laResources.length ==  1)
                {
                    this.loadResource(toModule, dromos.Bootstrap.normaliseName(laResources[0]));
                }
                else
                {
                    this._load(toModule);
                }
            },
            onCompletedLoading : function(toModule)
            {
                console.error("HERE - ONCOMPLETED");
                console.debug("Completed module " + toModule.getName() + " with order plugin");
                // Clear out the loaded module
                var lnIndex = m_aLoading.indexOf(toModule.getName());
                if (lnIndex >= 0)
                {
                    m_aLoading.splice(lnIndex,1);
                }
                
                // Load the next one
                if (m_aLoading.length > 0)
                {
                    loModule.plugin.load(dromos.Bootstrap.getModule(m_aLoading[0]));
                }
            }
        }
    ));
});