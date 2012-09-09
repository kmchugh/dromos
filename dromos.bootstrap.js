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
                if (toElement[tcAttribute])
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
            cleanURL : function(tcURL)
                {return tcURL + (tcURL.indexOf("?") < 0 ? "?" : "&") + "version=" + g_oDromos.Bootstrap["version"];}
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
                normaliseName : function(taScripts)
                {
                    return (dromos.utilities.isType(taScripts, 'Array') ? taScripts : [taScripts]).join('_').toLowerCase();
                },

                /**
                 * Adds the specified module to the Bootstrap.  If the module already exists, this will overwrite the existing module
                 * @param Module toModule the module to add
                 */
                setModule : function(toModule)
                {
                    m_oModules[toModule.getName()] = toModule;
                },

                /**
                 * Checks if the specified module is already in the list of modules
                 * @param  Module toModule the module being added
                 * @return true if the module already exists in the list of modules
                 */
                hasModule : function(toModule)
                {
                    return m_oModules[toModule.getName()] !== undefined;
                },

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
                getModule : function(tcModuleName)
                {
                    return m_oModules[tcModuleName] || null;
                },

                /**
                 * Gets the modules specified, if the module does not already exist it willl
                 * be created and the load started for the module
                 * @param  Array[String] the list of the scripts that are in the module
                 * @return Module the module retrieved or created by this call
                 */
                loadModule : function(taModules)
                {
                    var lcName = this.normaliseName(taModules);
                    return m_oModules[lcName] || new g_oDromos.Bootstrap.Module(taModules);
                },

                // Gets/sets the full path for the module specified
                getPath : function(tcModuleName, tcRoot){return m_oPaths[tcModuleName] || (tcRoot || this.getBaseURI()) + tcModuleName.replace(/^.+\//g, "");},
                setPath : function(tcModuleName, tcModulePath){m_oPaths[tcModuleName] = tcModulePath;},












                 /**
                * Adds the module specified to the list of modules that will be loaded.  Adding the same
                * module multiple times will have no effect.
                * toModuleDef should be an object with at least a name property
                */
               /*
                addModule : function(toModuleDef)
                {
                    var loModule = this.getModule(toModuleDef.name);
                    if (loModule === null)
                    {
                        // This is a new module
                        loModule = new g_oDromos.Bootstrap.Module(
                            {
                                name : toModuleDef.name,
                                dependencies : toModuleDef.dependencies || [],
                                loadedCallback : toModuleDef.loadedCallback
                            });
                        m_oModules[loModule.getName()] = loModule;
                        g_oBase.console.debug("Added module " + loModule.getName());
                    }
                    return loModule;
                },
                 */

                getCurrentScript : function()
                {
                    if (dromos.Bootstrap._interactive && dromos.Bootstrap._interactive.readyState ==='interactive')
                    {
                        return dromos.Bootstrap._interactive;
                    }
                    var loScript = null, laScripts = document.getElementsByTagName('script');
                    for (var i=laScripts.length - 1; i >= 0 && (loScript = laScripts[i]); i--)
                    {
                        if (loScript.readyState === 'interactive')
                        {
                            return (dromos.Bootstrap._interactive = loScript);
                        }
                    }
                    dromos.Bootstrap._interactive = null;
                    return null;
                },

                /**
                * Loads the specified module and calls toCallback when the module and
                * the module dependencies are full loaded.  If tcModuleName is already
                * loaded then the callback will be called directly.  The callback
                * will receive the module as the first parameter
                */
               /*
                loadModule : function(tcModuleName, toCallback)
                {
                    var loModule = this.getModule(tcModuleName);
                    if (loModule === null)
                    {
                        g_oBase.console.debug("Loading " + tcModuleName + " for first time");
                        // Get the module Shell
                        loModule = g_oDromos.Bootstrap.addModule({name : tcModuleName,
                                                            loadedCallback : toCallback});
                        // Ask the module to load
                        loModule.load();
                    }
                    else
                    {
                        g_oBase.console.debug("Retrieved " + tcModuleName);
                        if (toCallback)
                        {
                            toCallback.apply(loModule);
                        }
                    }
                    return loModule;
                },
                 */

                // Gets the specified plugin, if the plugin does not exist, then loads the plugin
                getDefaultPlugin : function()
                {
                    // If the plugin name is 'default' use the default plugin
                    if (dromos.Bootstrap.defaultPlugin === null)
                    {
                        dromos.Bootstrap.defaultPlugin = new g_oDromos.Bootstrap.Plugin();
                    }
                    return dromos.Bootstrap.defaultPlugin;
                }

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
        g_oDromos.Bootstrap.Module = (function(taScripts, toCallback)
        {
            var loModule = function(taScripts, toCallback)
            {
                if  (!dromos.utilities.isType(taScripts, 'Array') || taScripts.length == 0)
                {
                    throw "Scripts not provided for Bootstrap Module";
                }
                g_oBase.console.debug("Creating Module for " + taScripts);

                var m_cName = g_oDromos.Bootstrap.normaliseName(taScripts);
                var m_aCallbacks = [];

                /**
                 * Gets the normalised name of this module
                 * @return the name to uniquely identify this module
                 */
                this.getName = function(){return m_cName;};

                /**
                 * Checks if this module has any outstanding callbacks
                 * @return true if there are callbacks which have not yet been called
                 */
                this.hasCallbacks = function(){console.error('CALLBACKS  ' + m_aCallbacks); return m_aCallbacks.length > 0;},

                /**
                 * Private helper method to add callback to this module.
                 * @param Function toCallback, the callback to add
                 */
                this._addCallback = function(toCallback){m_aCallbacks[m_aCallbacks.length] = toCallback;};



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
            m_lIsLoaded : false,
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
                    }
                    else
                    {
                        console.debug("Adding callback to module [" + this.getName() + ']');
                        this._addCallback(toCallback);
                    }
                }
            },

            /**
             * Checks if this module is fully loaded and ready to use.  A module is fully loaded
             * when its script is loaded, all dependency scripts are loaded, and all callbacks
             * have been called
             * @return true if loaded, false otherwise
             */
            isLoaded : function(){return this.m_lIsLoaded;}
        };





        /*****************************************************************************
        * END PACKAGE
        *****************************************************************************/

        /**
        * A Package is a list of required modules and a callback function that will be
        * called when all of the modules in the package and their dependencies are fully loaded.
        **/

        /*
        g_oDromos.Bootstrap.Package = (function(taModuleList, tfnCallback)
        {
            var loPackageConstructor = function(taModuleList, tfnCallback)
            {
                g_oBase.console.debug("Creating Package for " + taModuleList);
                var m_fnCallback = tfnCallback || null;
                var m_aRequiredModules = taModuleList;
                var m_nLoadedModules = 0;
                var m_cIdentifier = taModuleList;

                // Loads the modules that are required by the package
                this.loadModules= function()
                {
                    var loSelf = this;
                    for (var i=0, lnLength = m_aRequiredModules.length; i<lnLength; i++)
                    {
                        var lcKey = m_aRequiredModules[i].toLowerCase();
                        m_aRequiredModules[i] = lcKey;

                        g_oDromos.Bootstrap.loadModule(lcKey, function()
                        {
                            loSelf.onModuleLoaded(this, arguments);
                        })
                    }
                }

                // Occurs when a module completes loading
                this.onModuleLoaded = function(toModule, taArgs)
                {
                    console.debug("Package loaded " + m_cIdentifier);
                    m_nLoadedModules++;
                    if (m_nLoadedModules == m_aRequiredModules.length && m_fnCallback != null)
                    {
                        var loSelf = this;
                        var laParams = [];
                        for (var i=0, lnLength = m_fnCallback.length; i<lnLength; i++)
                        {
                            laParams.push(g_oDromos.Bootstrap.getModule(m_aRequiredModules[i]).getDefinition());
                        }
                        try
                        {
                            m_fnCallback.apply(loSelf, laParams);
                        }
                        catch (ex)
                        {
                            console.error(ex.message);
                            throw ex;
                        }
                    }
                }

                // Show a warning if the required modules have not all been loaded and modules and there is 
                // no callback
                if (m_fnCallback == null && m_aRequiredModules.length != m_nLoadedModules)
                {
                    console.log("No callback function was defined AND not all of the modules had previously been loaded");
                }

                // Force the Package to start loading
                this.loadModules();
            }
            return loPackageConstructor;
        })();
         */
/*
        // The module definition
        g_oDromos.Bootstrap.Module = (function(toModule)
        {
            // Module constructor function
            var loModuleDefinition = function(toModule)
            {
                g_oBase.console.debug("Creating module " + toModule.name);
                var m_cName;
                var m_cPath;
                var m_oDefinition;
                var m_aDependencies = [];
                var m_aLoadedCallbacks = [];
                var m_oTag;

                // Gets the name of the module
                this.getName = function(){return m_cName;};

                // Gets the path of this module
                this.getPath = function(){return m_cPath;};

                // Gets the definition for this module, the defenition is the object the module represents
                this.getDefinition = function(){return m_oDefinition;};
                this.setDefinition = function(toDefinition){g_oBase.console.debug("modifying definition of " + this.getName());m_oDefinition = toDefinition;}

                // Adds a dependency to this module
                this.addDependency = function(tcName)
                {   
                    var loModule = g_oDromos.Bootstrap.loadModule(tcName);
                    var lcModuleName = loModule.getName();
                    if (this.indexOf(lcModuleName) <0)
                    {
                        console.debug("Adding dependency " + lcModuleName + " to " + this.getName());
                        m_aDependencies.push(lcModuleName);
                    }
                };

                // Gets all of the dependencies for this module
                this.getDependencies = function(){return m_aDependencies;};

                // Gets the index of the specified dependency
                this.indexOf = function(tcModule){return m_aDependencies.indexOf(tcModule);};

                // GET/SET the script tag that is associated with this module
                this.setTag = function(toTag){m_oTag = toTag;};
                this.getTag = function(){return m_oTag;};

                this.isCompleted = function(){return (m_oTag && m_oTag.module == null);}

                // Gets an array of dependency objects which can be passed to a callback
                this.getCallbackArguments = function()
                {
                    var laDependencies = this.getDependencies();
                    var loArgs = [];
                    for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
                    {
                        loArgs[i] = g_oDromos.Bootstrap.getModule(laDependencies[i]).getDefinition();
                        console.debug("pushed " + laDependencies[i] + "\n" + " to argument " + (i+1));
                    }
                    return loArgs;
                }

                this.addLoadedCallback = function(toCallback)
                {
                    // Adds an additional callback function
                    if (!toCallback){return;}

                    g_oBase.console.debug("Adding callback to " + this.getName());
                    m_aLoadedCallbacks.push(toCallback);
                }

                // This executes the callbacks when this module is completely loaded
                this.executeLoadedCallbacks = function()
                {
                    g_oBase.console.debug("Executing callbacks for " + this.getName());
                    for (var i=m_aLoadedCallbacks.length-1, lnLength = 0; i>=lnLength; i--)
                    {
                        var laArgs = this.getCallbackArguments();
                        g_oBase.console.debug("Executing module " + this.getName() + " callback " + (i+1) + "/" + m_aLoadedCallbacks.length + "\n\targs: " + laArgs);
                        try
                        {
                            var loResult = m_aLoadedCallbacks[i].apply(this, laArgs);
                            if (loResult)
                            {
                                this.setDefinition(loResult);
                            }
                        }
                        catch(ex)
                        {
                            console.error("Callback failed - \n" + m_aLoadedCallbacks[i] + "\n\n\n" + ex);
                            throw ex;
                        }
                    }
                    m_aLoadedCallbacks.length = 0;
                }

                // Initialisation 
                var loInfo = g_oDromos.Bootstrap.Module.extractInfo(toModule.name);
                var loSelf = this;
                m_cName = loInfo.name;
                m_cPath = loInfo.path;

                if (toModule.loadedCallback)
                {
                    this.addLoadedCallback(toModule.loadedCallback);
                }
                this.plugin = loInfo.plugin === "" ? g_oDromos.Bootstrap.getDefaultPlugin() :
                    {
                        load : function(){
                            this.load = function(){};
                            require("dromos.bootstrap." + loInfo.plugin, 
                                function(toPlugin)
                                    {
                                        loSelf.plugin = toPlugin;
                                        loSelf.plugin.load(loSelf);
                                    });
                            }
                    }

                // Add the dependencies
                for (var i=0, lnLength = (toModule.dependencies || []).length; i<lnLength; i++)
                {
                    this.addDependency(toModule.dependencies[i]);
                }
            };

            // Add the extractInfo method to the Module
            // Helper function to extract the name and path of the specified module
            loModuleDefinition.extractInfo = function(tcModuleURL)
            {
                tcModuleURL = tcModuleURL.toString().toLowerCase();
                var loInfo = null;
                if (/^\[.+/.test(tcModuleURL))
                {
                    loInfo = {name : tcModuleURL,
                                path : "",
                                plugin : ""
                            };
                }
                else
                {
                    loInfo = {
                                name : (tcModuleURL.replace(/^.+!|.js$/g, "")).replace(g_oDromos.Bootstrap.getDefaultRoot(), "").toLowerCase(),
                                path : tcModuleURL.replace(/^.+!|[^/]+(.js)?$|^http[s]?:\/\/[^/]+/g, ""),
                                plugin : tcModuleURL.replace(/!?[^!]+$/g, "")
                            };
                    loInfo.path = (/^[./]/.test(loInfo.path)) ? loInfo.path : g_oDromos.Bootstrap.getDefaultRoot() + loInfo.path;
                }
                return loInfo;
            };
            return loModuleDefinition;  
        })();

        */
        /*
        g_oDromos.Bootstrap.Module.prototype = {
            // Asks the module plugin to load the module
            load : function(){if (!this.loadDependencies()){this.plugin.load(this);}},
            loadDependencies : function()
            {
                var laDependencies = this.getDependencies();
                var llLoading = false;

                for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
                {
                    var lcDependency = laDependencies[i];
                    // Get the module
                    var loModule = g_oDromos.Bootstrap.getModule(lcDependency);
                    if (!loModule.isLoading())
                    {
                        llLoading = loModule.plugin.load(loModule) || llLoading;
                    }
                }
                return llLoading;
            },
            // GETS the URL for this module
            getURL : function(){return g_oDromos.utilities.cleanURL(g_oDromos.Bootstrap.getPath(this.getName(), this.getPath()));},
            // Notifies that this modules script has completed loading.
            completedLoading : function(toModuleDefinition, tnCount)
            {
                window.clearTimeout(this.timeout);
                toModuleDefinition = toModuleDefinition || g_oDromos.Bootstrap._interactive;
                if (toModuleDefinition)
                {
                    if (toModuleDefinition.dependencies && toModuleDefinition.dependencies.length > 0)
                    {
                        for (var i=0, lnLength=toModuleDefinition.dependencies.length; i<lnLength; i++)
                        {
                            this.addDependency(toModuleDefinition.dependencies[i]);
                        }
                        toModuleDefinition.dependencies = [];
                    }
                    this.addLoadedCallback(toModuleDefinition.loadedCallback);
                    toModuleDefinition.loadedCallback = null;
                }

                // This can only be set as complete if all the dependencies are loaded
                var laDependencies = this.getDependencies();
                var laArgs = [];
                if (laDependencies.length > 0)
                {
                    g_oBase.console.debug("Checking dependencies for " + this.getName());
                    for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
                    {
                        var loModule = g_oDromos.Bootstrap.getModule(laDependencies[i]);
                        if (!loModule.isCompleted())
                        {
                            var loSelf = this;
                            loModule.addLoadedCallback(function(){loSelf.completedLoading(toModuleDefinition);});
                            g_oBase.console.debug(loModule.getName() + " is not yet completed");
                            return;
                        }
                        laArgs[i] = loModule;
                    }
                }

                if (toModuleDefinition && toModuleDefinition.definition && !this.getDefinition())
                {
                    this.setDefinition(dromos.utilities.isType(toModuleDefinition.definition, "Function") ? toModuleDefinition.definition.apply(this, laArgs) : toModuleDefinition.definition);
                }

                if (this.getTag().readyState && !this.getDefinition() && (!tnCount || tnCount <3))
                {
                    var loSelf = this;
                    this.timeout = window.setTimeout(function(){loSelf.completedLoading(toModuleDefinition, (tnCount || 0)+1);}, 500);
                    return;
                }

                g_oBase.console.debug("Script for " + this.getName() + " completed loading [" + this.getTag().src + "]");
                this.getTag().module = null;

                // If this script has a value then complete, otherwise wait for a definition
                this.executeLoadedCallbacks();
                this.plugin.onCompleted(this);
            }
        };

        */

        // Default plugin, any plugins should inherit from this object, by default this plugin will load
        // .js files
        g_oDromos.Bootstrap.Plugin = function(){
            return {
                // Loads the module specified if it is not already loaded
                load : function(toModule){
                    if (!toModule.loadDependencies())
                    {
                        // Dependencies are loaded and complete, load this dependency
                        this.addScriptTag(toModule);
                    }
                },
                /***
                 * Adds the script tag to the page
                 */
                addScriptTag : function(toModule)
                {
                    if (!toModule.getTag())
                    {
                        toModule.setTag(g_oDromos.utilities.getScript(lcURL));
                        if (toModule.getTag() == null)
                        {
                            // Make sure we are ready
                            var loTag = document.createElement("script");
                            loTag.type = "text/javascript";
                            loTag.charset = "utf-8";
                            loTag.async = true;
                            loTag.module = toModule;
                            toModule.setTag(loTag);
                            g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptLoaded, loTag.detachEvent ? "readystatechange" : "load");
                            g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptError, "error");
                            document.getElementsByTagName("head")[0].appendChild(loTag);

                            var lcURL = toModule.getURL();
                            // Setting the src AFTER adding to the dom is on purpose to deal with some IE inconsistancies
                            loTag.src = (!/.js$|.js\?/i.test(lcURL)) ? lcURL.replace(/(\?)|([^.js]$)/, "$2.js$1") : lcURL;
                            g_oBase.console.debug("Added script for " + toModule.getName() + " ("+ loTag.src + ")");
                        }
                    }
                },
                // Executed when there is an error loading the script
                onScriptError : function(toEvent)
                {
                    var loTag = (toEvent.currentTarget || toEvent.srcElement);
                    var loModule = loTag.module;
                    loModule.plugin.onError(loModule);

                    g_oDromos.utilities.removeEventListener(loTag, loModule.plugin.onScriptLoaded, loTag.detachEvent ? "readystatechange" : "load");
                    g_oDromos.utilities.removeEventListener(loTag, loModule.plugin.onError, "error");
                },
                // Executed when the script completes loading
                onScriptLoaded : function(toEvent)
                {
                    var loTag = toEvent.currentTarget || toEvent.srcElement;
                    if (loTag.module && (toEvent.type === "load" || (loTag && /^(loaded|complete)$/.test(loTag.readyState))))
                    {
                        var loModule = loTag.module;
                        g_oDromos.utilities.removeEventListener(loTag, loModule.plugin.onScriptLoaded, loTag.detachEvent ? "readystatechange" : "load");
                        g_oDromos.utilities.removeEventListener(loTag, loModule.plugin.onScriptError, "error");
                        loModule.completedLoading();
                    }
                },
                // Executed when there is an error loading the script, can be overridden
                onError : function(toModule){g_oBase.console.error(toModule.getName() + " was not loaded")},
                // Occurs once the module has completed loading
                onCompleted : function(toModule){g_oBase.console.debug(toModule.getName() + " is completed")}
            };  
        };
        // Extends this class by creating a new class with the specified extension properties
        // TODO: Refactor to general usage
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

            // Make sure it is a package we are attempting to load
            taModules = dromos.utilities.isType(taModules, "Array") ? taModules : [taModules];

            // Get the package
            var loModule = g_oDromos.Bootstrap.loadModule(taModules);
            loModule.addCallback(toCallback);

            // Return the module, this is for calls such as "require('jquery')" which do not need a callback
            return loModule.isLoaded()  && loModule.moduleCount() == 1 ?loModule.getModuleDefinition(0) : null;
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


        // Define the define function, clobbers any existing define
        g_oBase["define"] = function(tcModuleName, taDependencies, toCallback)
        {
            toCallback = toCallback || taDependencies || tcModuleName;
            taDependencies = g_oDromos.utilities.isType(taDependencies, "Array") ? taDependencies :
                g_oDromos.utilities.isType(tcModuleName, "Array") ? tcModuleName : [];
            llAnonymous = !g_oDromos.utilities.isType(tcModuleName, "String");
            tcModuleName = llAnonymous ? "anonymous" : tcModuleName;

            console.debug("DEFINING " + tcModuleName + " as " + (g_oDromos.utilities.isType(toCallback, "Function") ? "Function" : "Object") + " with " + taDependencies);
            var loModule = llAnonymous ? null : g_oDromos.Bootstrap.getModule(tcModuleName);
            if (loModule == null)
            {
                // Create the module
                if (!llAnonymous)
                {
                    loModule = g_oDromos.Bootstrap.addModule({
                        name : tcModuleName,
                        dependencies : taDependencies
                    });
                }
            }
            if (!llAnonymous && g_oDromos.utilities.isType(toCallback, "Object"))
            {
                loModule.setDefinition(toCallback);
            }
            else if (!llAnonymous && g_oDromos.utilities.isType(toCallback, "Function"))
            {
                if (taDependencies.length == 0)
                {
                    loModule.setDefinition(toCallback());
                }
                else
                {
                    console.error("MODULE WITH DEPENDENCIES");
                }
            }
            else
            {
                var loInteractive = g_oDromos.Bootstrap.getCurrentScript();
                var loModuleDef = {
                        dependencies : g_oDromos.utilities.isType(taDependencies, "Array") ? taDependencies : [],
                        definition : !g_oDromos.utilities.isType(taDependencies, "Array") || taDependencies.length == 0 ? toCallback : null,
                        loadedCallback : g_oDromos.utilities.isType(taDependencies, "Array") && taDependencies.length > 0 ? toCallback : null
                    };

                if (loInteractive)
                {
                    loInteractive.module.completedLoading(loModuleDef);
                }
                else
                {
                    g_oDromos.Bootstrap._interactive = loModuleDef;
                }
            }
        }
        g_oBase["define"].amd = {jQuery:true};

        

        

        // Load the default dromos library
        require(["jquery", "underscore", "backbone"], function(jQuery)
        {
            define("dromos.bootstrap", g_oDromos);

            // Clean up the namespaces
            g_oDromos.$jQ = jQuery.noConflict();
            g_oDromos._ = _.noConflict();
            g_oDromos.$bb = Backbone.noConflict();

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
