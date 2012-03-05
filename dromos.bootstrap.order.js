/*====================================
Ordering plugin for dromos bootstrap.

This plugin will load any modules indicated in the order they are presented.
====================================*/
define(function(){
    var m_aLoading = [];

    return new (dromos.Bootstrap.Plugin.extend(
        {
            load : function(toModule)
            {
                // If the module is already loaded then there is nothing to do
                if (!toModule.isLoading() && !toModule.isCompleted())
                {
                    if (m_aLoading.indexOf(toModule.getName()) < 0)
                    {
                        m_aLoading.push(toModule.getName());
                    }
                    
                    // If this is the top module on the list, start to load it
                    if (m_aLoading[0] === toModule.getName())
                    {
                        this._load(toModule);
                    }
                }
            },
            onCompleted : function(toModule)
            {
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
                    var loModule = dromos.Bootstrap.getModule(m_aLoading[0]);
                    loModule.plugin.load(loModule);
                }
            }
        }
    ));
});