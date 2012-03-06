/*====================================
Text plugin for dromos bootstrap.

This plugin will load any modules indicated as text content.  The content of the file will be placed
inside a div tag and passed to the executing function as a parameter.
====================================*/
define(["jquery"],function($jQ){
    return new (dromos.Bootstrap.Plugin.extend(
        {
            load : function(toModule)
            {
                // If the module is already loaded then there is nothing to do
                if (!toModule.isLoading() && !toModule.isCompleted())
                {
                    $jQ.ajax({
                        url : toModule.getURL(),
                        context : this,
                        success: function(toData, tcStatus, toXHR){
                            var loTag = document.createElement("div");
                            loTag.innerHTML = toData;
                            toModule.setTag(loTag);
                            toModule.setDefinition(loTag);
                            toModule.complete();
                        },
                        error: function(toXHR, tcStatus, toError){
                            this.onError(loModule);
                        }});
                }
            }
        }
    ));
});