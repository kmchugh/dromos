/*=============================
dromos javascript bootstrap.  V0.30

This class should be included in any page that needs access to the dromos functionality.

Default configuration of the bootstrap can be modified by defining a require object that
contains the configuration options prior to loading of the bootstrap.  Alternatively require.config
can be called after loading of the bootstrap to modifiy the configuration.

For example, to turn on debugging, either declare the require object before loading e.g.:
<script type="text/javascript">
    require = {debug : true};
</script>
<script src="../dromos.bootstrap.js" type="text/javascript" charset="utf-8"></script>

or to turn on debug after load, call the config method:
require.config({debug : true});

// TODO: Document paths for defining static/alternate script locations
// TODO: Document parameterising scripts using dromos?parameter1=test
// TODO: Allow option of not loading jquery backbone or underscore through config
// TODO: Add ability to specifie what happens if a module can not load by adding a second function parameter to require
=============================*/


// Only allow dromos to be initialised once
if (!this["_dromos_initialised"])
{
    this["_dromos_initialised"] = true;
    (function(toBase) {
        var __VERSION__ = 0.30; // Version number, used in .js urls, so cache busting can be done by changing
        var __DEBUG__ = false; // debug mode.  Can be configured by calling require.config({debug : true});

        var g_oBase = toBase;  // usually reference to the window or server object

        // Update the console to ensure support for IE
        g_oBase.console = g_oBase.console || {
            log : function (){},
            error : function (){}
            };
        g_oBase.console.debug = g_oBase.console.debug || function(){};

        // Ensure dromos is defined
        var g_oDromos = g_oBase["dromos"] = g_oBase["dromos"] || {};
        g_oDromos.base = g_oBase;

        // Define some required utilities if they are not already loaded, these will be clobbered when dromos.utilities loads
        g_oDromos.utilities = g_oDromos.utilities ||
        {
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

            // Adds an event listener to the element specified
            addEventListener : (function(){
                return g_oBase.addEventListener ?
                    function(toElement, toCallback, tcEventType)
                    {
                        toElement['_'+tcEventType+'Handler'] = toElement['_'+tcEventType+'Handler'] || {};
                        toElement['_'+tcEventType+'Handler'][toCallback.toString()] = toElement['_'+tcEventType+'Handler'][toCallback] || function(e){toCallback(e);};
                        toElement.addEventListener(tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()], false);
                    } :
                    function(toElement, toCallback, tcEventType)
                    {
                        toElement['_'+tcEventType+'Handler'] = toElement['_'+tcEventType+'Handler'] || {};
                        toElement['_'+tcEventType+'Handler'][toCallback.toString()] = toElement['_'+tcEventType+'Handler'][toCallback] || function(e){toCallback(window.event);};
                        toElement.attachEvent("on" + tcEventType, toElement['_'+tcEventType+'Handler'][toCallback.toString()]);
                    };
            })(),
            // Removes an event listener from the element specified
            // TODO: ensure this is removing the event
            removeEventListener : (function(){
                return g_oBase.removeEventListener ?
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

            // Takes a URL and "Cleans" it by adding to the url, the default is to add the version from cachebuster
            cleanURL : function(tcURL){return tcURL + (tcURL.indexOf("?") < 0 ? "?" : "&") + "version=" + g_oDromos.Bootstrap["version"];}
        };

        // Define the bootstrap
        g_oDromos.Bootstrap = (function(toBase)
        {
            var m_oModules = {}; // The full list of modules
            var m_oPaths = {}; // The custom path to individual modules

            var m_oDromosScriptTag = g_oDromos.utilities.getScript("dromos.bootstrap.js");
            var m_cDromosRootURL = dromos.utilities.getAttribute(m_oDromosScriptTag, 'dromos-root') || dromos.utilities.getAttribute(m_oDromosScriptTag, 'src').substring(0, m_oDromosScriptTag.src.indexOf("dromos.bootstrap.js"));
            // The bootstrap object
            return {
                baseURI : m_cDromosRootURL,

                /**
                 * Gets the default root, this is the location to use as the base url when loading relative script locations
                 * @return the location to use as the base url
                 */
                getBaseURI : function(){return this.baseURI;},

                /**
                 * Gets the root of the dromos library.  This will be used when loading any dromos related libraries
                 * @return the location to use as the dromos base url
                 */
                getDromosRoot : function(){return m_cDromosRootURL;},

                /**
                 * Normalises the name of the module for indexing
                 * @param  String or Array[String] taScripts the name of the scripts to normalise
                 * @return a string representation of the module name
                 */
                normaliseName : function(taScripts){return (dromos.utilities.isType(taScripts, 'Array') ? taScripts : [taScripts]).join('|').toLowerCase().replace(/(^|\|)[^\!|\|]+\!/g, '$1');},

                /**
                 * Adds the specified module to the Bootstrap.  If the module already exists, this will overwrite the existing module
                 * @param Module toModule the module to add
                 */
                setModule : function(toModule){m_oModules[toModule.getName()] = toModule;},

                /**
                 * Checks if the specified module is already in the list of modules
                 * @param  String or Module toModule the module being added
                 * @return true if the module already exists in the list of modules
                 */
                hasModule : function(toModule){return m_oModules[dromos.utilities.isType(toModule, 'String') ? this.normaliseName(toModule) : toModule.getName()] !== undefined;},

                /**
                 * Adds a module to dromos.  If the module has previously been added this
                 * will cause an exeption
                 * @param Module toModule the module to add
                 */
                addModule : function(toModule)
                {
                    if (!this.hasModule(toModule))
                    {
                        this.setModule(toModule);
                    }
                    else
                    {
                        throw "Module " + toModule.getName() + " already exists";
                    }
                },

                /**
                 * Gets the module specified
                 * @param  String tcModuleName the name of the module to get
                 * @return The module or null if the module does not yet exist
                 */
                getModule : function(tcModuleName){return m_oModules[this.normaliseName(tcModuleName)] || null;},

                /**
                 * Gets the modules specified, if the module does not already exist it willl
                 * be created and the load started for the module
                 * @param  Array[String] the list of the scripts that are in the module
                 * @return Module the module retrieved or created by this call
                 */
                loadModule : function(taModules)
                {
                    var loModule = m_oModules[this.normaliseName(taModules)];
                    if (!loModule)
                    {
                        loModule = new g_oDromos.Bootstrap.Module(taModules);
                        loModule.load();
                    }
                    return loModule;
                },

                /**
                 * Creates a module but does not attempt to load the module from a script.
                 * Generally this is used for defining a module and its content.
                 * If a module of the name tcModuleName already exits, this call WILL overwrite that module
                 * @param  String the name of the module
                 * @return Module the module that has been created and set
                 */
                createModule : function(tcModuleName, toDefinition)
                {
                    tcModuleName = this.normaliseName(tcModuleName);
                    if (g_oDromos.Bootstrap.hasModule(tcModuleName))
                    {
                        delete m_oModules[tcModuleName];
                    }
                    var loModule = new g_oDromos.Bootstrap.Module([tcModuleName]);
                    if (toDefinition)
                    {
                        loModule.setDefinition(toDefinition);
                    }
                    g_oDromos.Bootstrap.setModule(loModule);
                    return loModule;
                },

                // Gets/sets the full path for the module specified
                getPath : function(tcModuleName, tcRoot)
                {
                    var lcReturn = null;
                    if (/^http/i.test(tcModuleName))
                    {
                        console.debug("Determined path[" + tcModuleName + "] for : " + tcModuleName);
                        return tcModuleName;
                    }
                    else if (/^\//.test(tcModuleName))
                    {
                        lcReturn = (tcRoot || this.getBaseURI()) + tcModuleName;
                        console.debug("Determined path[" + lcReturn + "] for : " + tcModuleName);
                        return lcReturn;
                    }
                    else
                    {
                        var lcMap = tcModuleName;
                        while (lcMap !== null)
                        {
                            // Check for a path
                            if (m_oPaths[lcMap.toLowerCase()])
                            {
                                lcReturn = this.getPath(m_oPaths[lcMap.toLowerCase()] + tcModuleName.replace(lcMap, ""));
                                console.debug("Determined path[" + lcReturn + "] for : " + tcModuleName);
                                return lcReturn;
                            }

                            // No path, check subpath
                            var loMatch = lcMap.match(/(^.+\/)[^\/]+$/);
                            if (loMatch && loMatch.length > 1)
                            {
                                lcMap = loMatch[1];
                                if (/\/$/.test(lcMap))
                                {
                                    lcMap = lcMap.substring(0, lcMap.length-1);
                                }
                            }
                            else
                            {
                                lcMap = null;
                            }
                        }
                        lcReturn = m_oPaths[tcModuleName] || (tcRoot || this.getBaseURI()) + tcModuleName;
                        console.debug("Determined path[" + lcReturn + "] for : " + tcModuleName);
                        return lcReturn;
                    }
                },
                setPath : function(tcModuleName, tcModulePath){m_oPaths[tcModuleName.toLowerCase()] = tcModulePath;},

                /**
                 * Gets the default plugin, the default plugin is the plugin used when attempting to load multiple modules, it is also the plugin
                 * that all other plugins will extend from when they are first created
                 * @return Plugin the default plugin
                 */
                getDefaultPlugin : function(){return g_oDromos.Bootstrap.defaultPlugin || (g_oDromos.Bootstrap.defaultPlugin = new g_oDromos.Bootstrap.Plugin());}
          };
     })(toBase);


        /*****************************************************************************
         * Module
         * A Module is a group of scripts that are grouped together for a
         * specific function.  A module can consist of a single script or a script with
         * dependencies.
         * Once all of the scripts in a module are loaded any callbacks
         * associated with the module are called
        *****************************************************************************/
        g_oDromos.Bootstrap.Module = (function(taResources, toCallback)
        {
            var loModule = function(taResources, toCallback)
            {
                if  (!dromos.utilities.isType(taResources, 'Array') || taResources.length === 0)
                {
                    throw "Resources not provided for Bootstrap Module";
                }

                var m_cName = g_oDromos.Bootstrap.normaliseName(taResources);
                var m_aResources = taResources;
                var m_aParents = [];
                var m_aCallbacks = [];
                var m_oDefinition = null;
                var m_lLoading = false;
                var m_lLoaded = false;
                var m_aModules = [];
                var m_aPlugins = taResources.length == 1 ? taResources[0].split('!') : [];
                m_aPlugins.pop();

                console.debug("creating Module for " + m_cName + " using plugins [" + m_aPlugins + "]");

                /**
                 * Gets the normalised name of this module
                 * @return the name to uniquely identify this module
                 */
                this.getName = function(){return m_cName;};

                /**
                 * Checks if this module has any outstanding callbacks
                 * @return true if there are callbacks which have not yet been called
                 */
                this.hasCallbacks = function(){return m_aCallbacks.length > 0;},

                /**
                 * Private helper method to add callback to this module.
                 * @param Function toCallback, the callback to add
                 */
                this._addCallback = function(toCallback){m_aCallbacks[m_aCallbacks.length] = toCallback;};

                /**
                 * Gets all of the callbacks associated with this module that have not yet been executed
                 * @return Array[function] the callbacks which have not been executed
                 */
                this.getCallbacks = function(){return m_aCallbacks;};

                /**
                 * Creates an array of callback parameters, these parameters will be in the same order as the
                 * scripts that were required by this module
                 */
                this.getCallbackParameters = function()
                {
                    var laParameters = [];
                     for (var i=0, lnLength=m_aResources.length; i<lnLength; i++)
                    {
                        var loModule = g_oDromos.Bootstrap.getModule(dromos.Bootstrap.normaliseName(m_aResources[i]));
                        laParameters[i] = (loModule && loModule.isLoaded()) ? loModule.getDefinition() : null;
                    }
                    if (this.getDefinition())
                    {
                        laParameters.unshift(this.getDefinition());
                    }
                    return laParameters;
                };

                /**
                 * Executes all of the callbacks that are set for this module.  After this call
                 * the callbacks will be cleared
                 */
                this.executeCallbacks = function()
                {
                    if (m_aCallbacks.length > 0)
                    {
                        console.debug("Executing callbacks for " + this.getName());
                        var laParams = this.getCallbackParameters();
                        for (var i=0, lnLength=m_aCallbacks.length; i<lnLength; i++)
                        {
                            var loCallback = m_aCallbacks[i];
                            if (loCallback)
                            {
                                m_aCallbacks[i] = null;
                                loCallback.apply(g_oBase, laParams);
                            }
                        }
                        m_aCallbacks = [];
                    }
                };

                /**
                 * Notifies the parent modules that this module has completed
                 */
                this.notifyParents = function()
                {
                    for (var i=0, lnLength=m_aParents.length; i<lnLength; i++)
                    {
                        var loModule = m_aParents[i];
                        if (loModule)
                        {
                            m_aParents[i] = null;
                            loModule.notifyCompletion(this);
                        }
                    }
                    m_aParents = [];
                };

                /**
                 * Gets the plugins that this module needs to be loaded with
                 * @return Array, a list of plugins, or an empty list if there are no plugins
                 */
                this.getPlugins = function(){return m_aPlugins;};

                /**
                 * Gets the list of scripts which have not yet been loaded
                 * @return this list of scripts which are still required by this module
                 */
                this.getResources = function(){return m_aResources;};

                /**
                 * Checks if the module is loading, a module that is loading is one that has been asked
                 * to load and has not yet loaded its scripts or not yet called its callback functions
                 * @return Boolean true if this module is not loading
                 */
                this.isLoading = function(){return m_lLoading;};

                /**
                 * Checks if this module is loaded.  A loaded module is a module that has loaded all dependencies
                 * and has already called any callback functions required for the script
                 * @return Boolean true if the module is ready to be used
                 */
                this.isLoaded = function(){return m_lLoaded;};

                /**
                 * Marks this module as loaded
                 */
                this.markLoaded = function(){m_lLoading = !(m_lLoaded = true);};

                /**
                 * Helper method for marking the module as loaded.  This is really only used by define in order to mark
                 * modules loaded that do not require any kind of script load.
                 * @param Boolean tlLoading the state to set the module to
                 */
                this._setLoading = function(tlLoading){m_lLoading =tlLoading;};

                /**
                 * Adds a parent to this module.  A parent module is a module that is waiting to be informed when this module has completed loading.
                 * If the module is already a parent it will not be added again
                 * @param Module toModule
                 */
                this.addParent = function(toModule)
                {
                    console.debug("Adding parent " + toModule.getName() + " to module " + this.getName());
                    for (var i=0, lnLength = m_aParents.length; i<lnLength; i++)
                    {
                        if (m_aParents[i] === toModule){return;}
                    }
                    m_aParents[m_aParents.length] =toModule;
                };

                /**
                 * Notifies this module that one of its dependencies has completed.
                 * @param  Module toModule The module that completed loading
                 */
                this.notifyCompletion = function(toModule)
                {
                    var i=0, lnLength = 0;
                    for (i=0, lnLength = m_aResources.length; i<lnLength; i++)
                    {
                        m_aModules[i] = m_aModules[i] || null;
                        if (dromos.Bootstrap.normaliseName(m_aResources[i]) === toModule.getName())
                        {
                            m_aModules[i] = toModule;
                            console.debug("Notifying " + this.getName() + " that " + toModule.getName() + " has completed");
                        }
                    }

                    // If all of the modules have been loaded then we are also complete
                    for (i=0, lnLength = m_aModules.length; i<lnLength; i++)
                    {
                        if (m_aModules[i] === null)
                        {
                            return;
                        }
                    }
                    this.onCompletedLoading();
                };

                /**
                 * Gets/Sets the definition of this module
                 * @param Object the defenition of this module
                 */
                this.getDefinition = function(){return m_oDefinition;};
                this.setDefinition = function(toDefinition)
                {
                    m_oDefinition = toDefinition;
                    // If we have a definition, then we are considered to be loaded
                    if (m_oDefinition !== undefined && m_oDefinition !== null)
                    {
                        m_lLoaded = !(m_lLoading = false);
                    }
                };

                if(toCallback)
                {
                    this.addCallback(toCallback);
                }
                g_oDromos.Bootstrap.addModule(this);
            };
            return loModule;
        })();


        g_oDromos.Bootstrap.Module.prototype = {
            m_aCallbacks : [],
            m_oPlugin : null,
            /**
             * Adds the specified callback to this module, if the module is already loaded then this
             * will execute the callback
             * @param the callback function
             */
            addCallback : function(toCallback)
            {
                if (toCallback && dromos.utilities.isType(toCallback, 'Function'))
                {
                    if (this.isLoaded())
                    {
                        console.debug("Executing callback for module [" + this.getName() + ']');
                        toCallback.apply(g_oBase, this.getCallbackParameters());
                    }
                    else
                    {
                        console.debug("Adding callback to module [" + this.getName() + ']');
                        this._addCallback(toCallback);
                    }
                }
            },
            /**
             * Loads the module if it is not already loaded.  Loading of a module is the act
             * of loading all dependencies, then loading this module.  An isLoading flag
             * is used to prevent against circular dependency locks
             */
            load : function()
            {
                if (!this.isLoading() && !this.isLoaded())
                {
                    console.debug("preparing to load " + this.getName());
                    this._setLoading(true);
                    this.getPlugin().load(this);
                }
            },
            /**
             * Gets the plugin for this midule
             * @return Plugin the plugin to use to load this module
             */
            getPlugin : function(){return this.m_oPlugin || (this.m_oPlugin = g_oDromos.Bootstrap.getDefaultPlugin());},

            /**
             * Gets the path of the specified resource, taking in to account dependent paths for relative paths
             * @param  String the resource to get the path for
             * @return String the path to the resource
             */
            getPath : function(tcResource)
            {
                // TODO: Implement relative to current module
                return g_oDromos.Bootstrap.getPath(tcResource);
            },

            /**
             * Occurs when the module has been notified by the bootstrap that its resource has completed loading
             */
            onCompletedLoading : function()
            {
                console.debug("Completed loading " + this.getName());
                var loOutstanding = g_oDromos.Bootstrap._outstandingDefinition;
                g_oDromos.Bootstrap._outstandingDefinition = null;
                if (loOutstanding)
                {
                    console.debug("Anonymous module identified as " + this.getName());
                    if (loOutstanding.dependencies && loOutstanding.dependencies.length > 0)
                    {
                        var loSelf = this;
                        require(loOutstanding.dependencies, function()
                        {
                            loSelf.setDefinition(loOutstanding.callback.apply(g_oBase, arguments));
                            loSelf.executeCallbacks();
                            loSelf.markLoaded();
                            loSelf.notifyParents();
                        });
                        return;
                    }
                    else if (loOutstanding.callback)
                    {
                        this.setDefinition(dromos.utilities.isType(loOutstanding.callback, "Function") ? loOutstanding.callback.call(g_oBase) : loOutstanding.callback);
                    }
                }
                this.executeCallbacks();
                this.markLoaded();
                this.notifyParents();
            }
        };

        /*****************************************************************************
        * END PACKAGE
        *****************************************************************************/

        /*****************************************************************************
         * PLUGIN
         * A Plugin is used to load modules according to the rules of the plugin
        *****************************************************************************/
        g_oDromos.Bootstrap.Plugin = function(tcName)
        {
            var m_cName = tcName || "Default Plugin";

             // Gets the name of this plugin
            this.getName = function(){return m_cName;};
        };

        g_oDromos.Bootstrap.Plugin.prototype =
        {
            /**
             * Attempts to load the module specified by loading the resources required for that module
             * @param  Module the module being loaded
             */
            load : function(toModule)
            {
                if (!toModule.isLoaded())
                {
                    this.onLoad(toModule);
                }
            },
            /**
             * The actual loading mechanism for the plugin, this should be overriden in subclasses to give alternative load actions
             * @param  Module the module being loaded
             */
            onLoad : function(toModule)
            {
                console.debug("loading module " + toModule.getName());
                var laResources = toModule.getResources();
                if (laResources.length ==  1)
                {
                    // Extract Plugin info
                    var laPlugins = toModule.getPlugins();
                    if (laPlugins.length === 0)
                    {
                        g_oDromos.Bootstrap.getDefaultPlugin().loadResource(toModule, laResources[0]);
                    }
                    else
                    {
                        // TODO : For now, no chaining of plugins, this we will support later
                        var lcPlugin = laPlugins[0];
                        console.debug("using plugin dromos.bootstrap." + lcPlugin + " for " + toModule.getName());
                        require("dromos.bootstrap." + lcPlugin, function(toPlugin)
                        {
                            console.debug("using the plugin " + lcPlugin + " to load the module");
                            toPlugin.load(toModule);
                        });
                    }
                }
                else
                {
                    var laCompleted = [], i;
                    for (i=0, lnLength = laResources.length; i<lnLength; i++)
                    {
                        console.debug("extracted dependency " + laResources[i] + " for " + toModule.getName());
                        var loModule = g_oDromos.Bootstrap.loadModule([laResources[i]]);
                        loModule.addParent(toModule);
                        if (loModule.isLoaded())
                        {
                            laCompleted[laCompleted.length] = loModule;
                        }
                    }
                    for (i=0, lnLength = laCompleted.length; i<lnLength; i++)
                    {
                        toModule.notifyCompletion(laCompleted[i]);
                    }
                }
            },
            /**
             * Loads the resource specified,
             * @param  Module toModule the module that is expecting the resource to be loaded
             * @param  String tcResource the resource to load
             */
            loadResource : function(toModule, tcResource)
            {
                console.debug("loading resource " + tcResource);
                // Default action is simply adding the script tag to the head
                this.addScriptTag(toModule, tcResource);
            },
            /**
             * The default extension to add to the resource for this plugin
             * @return the extension including the '.'
             */
            getResourceExtension : function(){return '.js';},
            /**
             * Adds a script tag to load the resource specified, this will notify the module when the resource is loaded
             * @param Module toModule the module that the resource is being loaded for
             * @param String tcScriptName the name of the script being loaded
             */
            addScriptTag  : function(toModule, tcScriptName)
            {
                if (toModule._tag === undefined)
                {
                    var lcScript = toModule.getPath(tcScriptName);
                    var lcExt = this.getResourceExtension();
                    var lcRegExpExt = lcExt.replace('.', '\\.');
                    var loTestExp = new RegExp(lcRegExpExt + "$|" + lcRegExpExt + "\\?","i");
                    var loReplaceExp = new RegExp("(\\?)|([^"+ lcRegExpExt +"].)$");
                    lcScript = (loTestExp.test(lcScript)) ? lcScript : lcScript.replace(loReplaceExp, "$2" + lcExt + "$1");

                    // See if the script has already been loaded
                    toModule._tag = g_oDromos.utilities.getScript(lcScript);
                    if (toModule._tag === null)
                    {
                        var loSelf = this;
                        console.debug("adding script " + lcScript);
                        var loTag = document.createElement("script");
                        loTag.type = "text/javascript";
                        loTag.charset = "utf-8";
                        loTag.async = true;
                        loTag._module = toModule;
                        toModule._tag = loTag;
                        g_oDromos.utilities.addEventListener(loTag, function(toEvent){loSelf.onResourceLoaded.call(loSelf, toEvent);}, loTag.detachEvent ? "readystatechange" : "load");
                        g_oDromos.utilities.addEventListener(loTag, function(toEvent){loSelf.onResourceError.call(loSelf, toEvent);}, "error");
                        document.getElementsByTagName("head")[0].appendChild(loTag);

                        // Setting the src AFTER adding to the dom is on purpose to deal with some IE inconsistancies
                        loTag.src = (!/.js$|.js\?/i.test(lcScript)) ? lcScript.replace(/(\?)|([^.js]$)/, "$2.js$1") : lcScript;
                        g_oBase.console.debug("Added script for " + toModule.getName() + " ("+ loTag.src + ")");
                    }
                    else
                    {
                        console.debug("script " + lcScript + " has already been added");
                        this.onResourceLoaded({"currentTarget" : toModule._tag});
                    }
                }
            },
            onResourceLoaded : function(toEvent)
            {
                var loTag = toEvent.currentTarget || toEvent.srcElement;
                if (loTag && loTag._module && (toEvent.type === "load" || (loTag && /^(loaded|complete)$/.test(loTag.readyState))))
                {
                    var loModule = loTag._module;
                    g_oDromos.Bootstrap._outstandingModule = loModule;
                    g_oDromos.utilities.removeEventListener(loTag, function(toEvent){loSelf.onResourceLoaded.call(this, toEvent);}, loTag.detachEvent ? "readystatechange" : "load");
                    g_oDromos.utilities.removeEventListener(loTag, function(toEvent){loSelf.onResourceError.call(this, toEvent);}, "error");
                    loModule.onCompletedLoading();
                    this.onCompleted(loModule);
                }
            },
            onResourceError : function(toEvent)
            {
                var loTag = toEvent.currentTarget || toEvent.srcElement;
                if (loTag && loTag._module)
                {
                    var loModule = loTag._module;
                    g_oDromos.utilities.removeEventListener(loTag, function(toEvent){loSelf.onResourceLoaded.call(this, toEvent);}, loTag.detachEvent ? "readystatechange" : "load");
                    g_oDromos.utilities.removeEventListener(loTag, function(toEvent){loSelf.onResourceError.call(this, toEvent);}, "error");
                    this.onError(loModule);
                }
            },
            // Executed when there is an error loading the script, can be overridden
            onError : function(toModule){g_oBase.console.error(toModule.getName() + " was not loaded");},
            // Occurs once the module has completed loading
            onCompleted : function(toModule){g_oBase.console.debug(toModule.getName() + " is completed");}
        };

        g_oDromos.Bootstrap.Plugin.extend = function(toSubclass)
        {
            var loPrototype = new this();
            var loSuperClass = this.prototype;

            for (var lcProperty in toSubclass)
            {
                if (loPrototype[lcProperty])
                {
                    loPrototype["_"+lcProperty] = loPrototype[lcProperty];
                }
                loPrototype[lcProperty] = toSubclass[lcProperty];
            }
            function Class(){}
            Class.prototype = loPrototype;
            Class.prototype.constructor = Class;
            Class.extend = arguments.callee;
            return Class;
        };

        /*****************************************************************************
         * END PLUGIN
        *****************************************************************************/









        // Extends this class by creating a new class with the specified extension properties
        // TODO: Refactor to general usage
        /*
        g_oDromos.Bootstrap.Plugin.extend = function(toSubclass)
        {
            var loPrototype = new this();
            var loSuperClass = this.prototype;

            for (var lcProperty in toSubclass)
            {
                if (loPrototype[lcProperty])
                {
                    loPrototype["_"+lcProperty] = loPrototype[lcProperty];
                }
                loPrototype[lcProperty] = toSubclass[lcProperty];
            }
            
            function Class(){};
            Class.prototype = loPrototype;
            Class.prototype.constructor = Class;
            Class.extend = arguments.callee;
            return Class;
        };
 */



        /*****************************************************************************
         * REQUIRE AND CONFIGURATION
        *****************************************************************************/

        // Define the require function, clobbers any existing require,
        // if a require exists but is an object, it will be stored and used
        // as a configuration object
        var loConfig = [
            {
                version : __VERSION__,
                debug : __DEBUG__,
                paths : {
                    "underscore" : g_oDromos.Bootstrap.getDromosRoot() + "lib/underscore.js",
                    "backbone" : g_oDromos.Bootstrap.getDromosRoot() + "lib/backbone-min.js",
                    "jquery" : g_oDromos.Bootstrap.getDromosRoot() + "lib/jquery.min.js",
                    "jqueryui" : g_oDromos.Bootstrap.getDromosRoot() + "lib/jquery-ui.min.js"
                    }
            },  g_oBase['require'] || {}
        ];

        /**
         * Dynamically loads the specified modules and dependencies, and once the
         * dependencies are resolved the callback if cclled with each module as a parameter
         * @param  String OR Array[String] the module or list of modules needed for the callback.
         * @param  the callback function.  This function will be called with each module as a parameter in the order specified by taModules
         */
        g_oBase["require"] = function(taModules, toCallback)
        {
            console.debug("REQUIRING : " + taModules);
            var loModule = g_oDromos.Bootstrap.loadModule(dromos.utilities.isType(taModules, "Array") ? taModules : [taModules]);
            if (toCallback)
            {
                loModule.addCallback(toCallback);
            }
            // Return the module, this is for calls such as "require('jquery')" which do not need a callback
            return loModule.isLoaded() ? loModule.getDefinition(0) : null;
        };

        /**
         * Defines the require function for dromos.  This function will accept an object or an array of objects as it's
         * parameter.  If an array of objects the properties are applied in the order given in the array.
         *
         * This method is called on loading of dromos and can be called at any time by the developer to adjust
         * properties
         * @param  Object or array, the configuration options
         */
        g_oBase["require"].config = function(toConfig)
        {
            toConfig = dromos.utilities.isType(toConfig, "Array") ? toConfig : [toConfig];
            for (var i = 0, lnLength = toConfig.length; i<lnLength; i++)
            {
                var loConfig = toConfig[i];

                // Turn debugging messages on or off
                if (loConfig['debug'] !== undefined)
                {
                    console.debug("Turning debug " + (loConfig["debug"] ? " ON " : " OFF "));
                    g_oBase.console.debug = loConfig['debug'] ? function(tcMessage){g_oBase.console.log(tcMessage);} :function(){};
                }

                // Update the paths based on the configuration
                 if (loConfig['paths'] !== undefined)
                {
                    for (var lcPath in loConfig['paths'])
                    {
                        g_oDromos.Bootstrap.setPath(lcPath, loConfig.paths[lcPath]);
                    }
                }

                // Loop through all of the properties and set them
                for (var lcProperty in loConfig)
                {
                    if (lcProperty === "debug" || lcProperty === "paths"){}
                    else if (lcProperty === 'baseURI')
                    {
                        g_oDromos.Bootstrap[lcProperty] = loConfig[lcProperty] + (/.+\/$/.test(loConfig[lcProperty]) ? '' : '/');
                    }
                    else
                    {
                        g_oDromos.Bootstrap[lcProperty] = loConfig[lcProperty];
                    }
                }
            }
        };

        // Configure require
        require.config(loConfig);

        /*****************************************************************************
         * END REQUIRE AND CONFIGURATION
        *****************************************************************************/

        /*****************************************************************************
         * DEFINE
        *****************************************************************************/

        g_oBase['define'] = function(tcModuleName, taDependencies, toCallback)
        {
            // Normalise the parameters
            toCallback = toCallback || taDependencies || tcModuleName;
            taDependencies = g_oDromos.utilities.isType(taDependencies, "Array") ? taDependencies :
                g_oDromos.utilities.isType(tcModuleName, "Array") ? tcModuleName : [];
            tcModuleName = g_oDromos.utilities.isType(tcModuleName, "String") ? tcModuleName : null;

            if (tcModuleName)
            {
                // In this case we are specifically defining a module.  If a module of this name already exists it WILL be overwritten
                console.debug("DEFINING " + tcModuleName + " as " + (typeof(toCallback)) + " with [" + taDependencies + ']');
                g_oDromos.Bootstrap.createModule(tcModuleName, g_oDromos.utilities.isType(toCallback, "Function") ? toCallback.apply(this) : toCallback);
            }
            else
            {
                // This is an anonymous module, a define from a script load
                console.debug("DEFINING anonymous module as " + (g_oDromos.utilities.isType(toCallback, "Function") ? "Function" : "Object") + " with [" + taDependencies + ']');
                g_oDromos.Bootstrap._outstandingDefinition = {"dependencies" : taDependencies,
                                                                                                "callback" : toCallback};
            }


        };
        g_oBase["define"].amd = {jQuery:true};

        /*****************************************************************************
         * END DEFINE
        *****************************************************************************/


        /**
         * There are issues with underscore and backbone in an AMD environment, the following function
         * ensures that they are loaded (and accessible)
         * */
        require(["jquery", "underscore", "backbone"], function(jQuery)
        {
            // Clean up the namespaces
            g_oDromos.$jQ = jQuery.noConflict();
            g_oDromos._ = _.noConflict();
            g_oDromos.$bb = Backbone.noConflict();

            // Define the modules in dromos
            define("underscore", [], function(){return g_oDromos._;});
            define("backbone", [], function(){return g_oDromos.$bb;});

            // This is here instead of in the require as the setup above needs to take place to
            // allow jquery, underscore, and backbone to take part in amd loading
            require(["jqueryui", "order!dromos"], function(){
                define("jqueryui", g_oDromos.$jQ);
            });
        });
    })(this);
}
