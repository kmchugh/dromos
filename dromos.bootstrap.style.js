/*====================================
Style plugin for dromos bootstrap.

This plugin will load any css or less file indicated and attach them to the dom.
====================================*/
define(["jquery"],function($jQ){
    return new (dromos.Bootstrap.Plugin.extend(
        {
            load : function(toModule)
            {
                // If the module is already loaded then there is nothing to do
                if (!toModule.isLoading() && !toModule.isCompleted())
                {
                    var lcModule = toModule.getURL();
                    if (/.(le|c)ss($|\?)/i.test(lcModule))
                    {
                        $jQ.ajax({
                            url : lcModule,
                            context : this,
                            success: function(toData, tcStatus, toXHR){
                                var loTag = document.createElement("style");
                                loTag.innerHTML = toData;
                                toModule.setTag(loTag);
                                toModule.setDefinition(loTag);
                                document.head.appendChild(loTag);
                                toModule.complete();
                            },
                            error: function(toXHR, tcStatus, toError){
                                this.onError(toModule);
                            }});
                    }
                    else
                    {
                        this.onError(toModule);
                    }
                }
            }
        }
    ));
});