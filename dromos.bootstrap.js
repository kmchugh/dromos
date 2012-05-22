/*=============================
dromos javascript bootstrap.

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
=============================*/
// dromos initialisation
(function(toBase) {

    var __VERSION__ = 0.2; // Version number, used in .js urls, so cache busting can be done by changing
    var __DEBUG__ = true; // debug mode.  Can be configured by calling require.config({debug : true});

    var g_oBase = toBase;  // usually reference to the window or server object

    // Update the console to ensure support for IE
    g_oBase.console = {
        m_oConsole : g_oBase.console || {log : function(){}, error: function(){}},
        log : function(tcMessage){g_oBase.console.m_oConsole.log(tcMessage);},
        error : function(tcMessage){g_oBase.console.m_oConsole.error(tcMessage);},
        debug : function(tcMessage){g_oBase.console.m_oConsole.log(tcMessage);}
    };
    
    // Ensure dromos is defined
    var g_oDromos = g_oBase["dromos"] = g_oBase["dromos"] || {};
    g_oDromos.base = g_oBase;

    // Define some required utilities if they are not already loaded
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
                    function(toElement, toCallback, tcEventType){toElement.addEventListener(tcEventType, function(e){toCallback(e)}, false);} :
                    function(toElement, toCallback, tcEventType){toElement.attachEvent("on" + tcEventType, function(e){toCallback(window.event)});};
            })(),
            // Removes an event listener from the element specified
            // TODO: ensure this is removing the event
            removeEventListener : (function(){
                return g_oBase.removeEventListener ?
                    function(toElement, toCallback, tcEventType){toElement.removeEventListener(tcEventType, function(e){toCallback(e)}, false);} :
                    function(toElement, toCallback, tcEventType){toElement.detachEvent("on" + tcEventType, function(e){toCallback(window.event)});};
            })(),

            // Takes a URL and "Cleans" it by adding to the url, the default is to add the version from cachebuster
            cleanURL : function(tcURL)
                {return tcURL + (tcURL.indexOf("?") < 0 ? "?" : "&") + "version=" + g_oDromos.Bootstrap["version"];}
        };

    // Define the bootstrap
    g_oDromos.Bootstrap = (function(toBase){

        // The full list of modules
        var m_oModules = {};

        // The custom path to individual modules
        var m_oPaths = {};

        // The bootstrap object
        return {
            /**
            * Loads the specified module and calls toCallback when the module and
            * the module dependencies are full loaded.  If tcModuleName is already
            * loaded then the callback will be called directly.  The callback
            * will receive the module as the first parameter
            */
            loadModule : function(tcModuleName, toCallback)
            {
                var loModule = this.getModule(tcModuleName);
                if (loModule == null)
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

            /**
            * Retrieves the module specified.  toModule can either be a module or a module name
            */
            getModule : function(toModule)
            {
                return m_oModules[g_oDromos.utilities.isType(toModule, 'String') ? 
                    g_oDromos.Bootstrap.Module.extractInfo(toModule).name.toLowerCase() : 
                    toModule.getName()] || null;
            },

            /**
            * Adds the module specified to the list of modules that will be loaded.  Adding the same
            * module multiple times will have no effect.
            * toModuleDef should be an object with at least a name property
            */
            addModule : function(toModuleDef)
            {
                var loModule = this.getModule(toModuleDef.name);
                if (loModule == null)
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

            // Gets/sets the full path for the module specified
            getPath : function(tcModuleName, tcModulePath){return m_oPaths[tcModuleName] || tcModulePath + tcModuleName.replace(/^.+\//g, "");},
            setPath : function(tcModuleName, tcModulePath){m_oPaths[tcModuleName] = tcModulePath;},

            // Gets the root directory to looking for modules in, or to base relative urls from
            getDefaultRoot : function(){return g_oDromos.Bootstrap["baseUrl"];},

            // Gets the specified plugin, if the plugin does not exist, then loads the plugin
            getDefaultPlugin : function()
            {
                // If the plugin name is 'default' use the default plugin
                if (dromos.Bootstrap.defaultPlugin == null)
                {
                    dromos.Bootstrap.defaultPlugin = new g_oDromos.Bootstrap.Plugin();
                }
                return dromos.Bootstrap.defaultPlugin;
            }

        };
    })(toBase);

    /**
    * A Package is a list of required modules and a callback function that will be
    * called when all of the modules in the package and their dependencies are fully loaded.
    **/
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
                m_nLoadedModules++;
                if (m_nLoadedModules == m_aRequiredModules.length && m_fnCallback != null)
                {
                    var laParams = [];
                    for (var i=0, lnLength = m_aRequiredModules.length; i<lnLength; i++)
                    {
                        laParams.push(g_oDromos.Bootstrap.getModule(m_aRequiredModules[i]).getDefinition());
                    }
                    try
                    {
                        m_fnCallback.apply(this, laParams);
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

            this.markCompleted = function(){m_lCompleteFlagged = true;};

            this.isCompleted = function(){return (m_oTag && /^(complete)$/.test(m_oTag.readyState));}

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

    g_oDromos.Bootstrap.Module.prototype = {
        // Asks the module plugin to load the module
        load : function(){if (!this.loadDependencies()){this.plugin.load(this);}},
        /**
         * This will load all of the dependencies for this module, this will
         * return true if the more dependencies need to be loaded after this call
         */
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
        completedLoading : function(toDefinition)
        {
            // Add in any additional dependencies
            if (toDefinition)
            {
                if (toDefinition.dependencies && toDefinition.dependencies.length > 0)
                {
                    for (var i=0, lnLength=toDefinition.dependencies.length; i<lnLength; i++)
                    {
                        this.addDependency(toDefinition.dependencies[i]);
                    }
                    toDefinition.dependencies = [];
                }
                this.addLoadedCallback(toDefinition.loadedCallback);
                toDefinition.loadedCallback = null;
            }

            // This can only be set as complete if all the dependencies are loaded
            var laDependencies = this.getDependencies();
            var laArgs = [];

            // This script is finished loading.  If there are no dependencies, or 
            // if all of the dependencies are loaded we can call the callbacks
            if (laDependencies.length != 0)
            {
                g_oBase.console.debug("Checking dependencies for " + this.getName());
                for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
                {
                    var loModule = g_oDromos.Bootstrap.getModule(laDependencies[i]);
                    if (!loModule.isCompleted())
                    {
                        var loSelf = this;
                        loModule.addLoadedCallback(function(){loSelf.completedLoading(toDefinition);});
                        g_oBase.console.debug(loModule.getName() + " is not yet completed");
                        return;
                    }
                    laArgs[i] = loModule;
                }
            }

            // If we got here then there were no dependencies, or they are all loaded
            g_oBase.console.debug("Dependencies completed for " + this.getName());
            if (toDefinition && toDefinition.definition)
            {
                this.setDefinition(dromos.utilities.isType(toDefinition.definition, "Function") ? toDefinition.definition.apply(this, laArgs) : toDefinition);
            }
            this.executeLoadedCallbacks();
            this.plugin.onCompleted(this);
            this.markCompleted();
        }
    };

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
                    var lcURL = toModule.getURL();
                    if (!/.js$|.js\?/i.test(lcURL))
                    {
                        lcURL = lcURL.replace(/(\?)|([^.js]$)/, "$2.js$1");
                    }
                    g_oBase.console.debug("Adding script for " + toModule.getName() + " ("+ lcURL + ")");
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
                        g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptLoaded, typeof(loTag.readyState) != 'undefined' ? "readystatechange" : "load");
                        g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptError, "error");
                        document.getElementsByTagName("head")[0].appendChild(loTag);
                        // Setting the src AFTER adding to the dom is on purpose to deal with some IE inconsistancies
                        loTag.src = lcURL;
                    }
                }
            },
            // Executed when there is an error loading the script
            onScriptError : function(toEvent)
            {
                var loTag = (toEvent.currentTarget || toEvent.srcElement);
                var loModule = loTag.module;
                loModule.plugin.onError(loModule);

                g_oDromos.utilities.removeEventListener(loTag, loTag.detachEvent ? "readystatechange" : "load", this.onScriptLoaded);
                g_oDromos.utilities.removeEventListener(loTag, "error", this.onScriptError);
            },
            // Executed when the script completes loading
            onScriptLoaded : function(toEvent)
            {
                var loTag = toEvent.currentTarget || toEvent.srcElement;
                if (toEvent.type === "load" || (loTag && /^(complete)$/.test(loTag.readyState)));
                {
                    if (!loTag.readyState)
                    {
                        loTag.readyState = "complete";
                    }
                    var loModule = loTag.module;
                    g_oBase.console.debug("Script for " + loModule.getName() + " completed loading [" + loTag.src + "]");
                    g_oDromos.utilities.removeEventListener(loTag, loTag.detachEvent ? "readystatechange" : "load", this.onScriptLoaded);
                    g_oDromos.utilities.removeEventListener(loTag, "error", this.onScriptError);
                    loTag.module = null;
                    var loDefinition = g_oDromos.Bootstrap.outstanding || null;
                    g_oDromos.Bootstrap.outstanding = null;
                    loModule.completedLoading(loDefinition);
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

    // Define the require function, clobbers any existing require,
    // if a require exists but is an object, it will be stored and used
    // as a configuration object
    var m_oOldRequire = g_oBase["require"];
    g_oBase["require"] = function(taModules, toCallback)
    {
        console.debug("REQUIRING : " + taModules);
        // If the first parameter is a string, make it an array
        taModules = dromos.utilities.isType(taModules, "String") ? [taModules] : taModules;

        // Create an anonymous package
        var loPackage = new g_oDromos.Bootstrap.Package(taModules, toCallback);
        var loModule = g_oDromos.Bootstrap.getModule(taModules[0]);
        return loModule ? loModule.getDefinition() : null;
    };

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
        else if (!llAnonymous && g_oDromos.utilities.isType(toCallback, "Function") && taDependencies.length == 0)
        {
            loModule.setDefinition(toCallback());
        }
        else
        {
            if (llAnonymous)
            {
                console.debug("Anonymous function loaded...");
                // An anonymous function
                g_oDromos.Bootstrap.outstanding = {
                    dependencies : g_oDromos.utilities.isType(taDependencies, "Array") ? taDependencies : [],
                    definition : !g_oDromos.utilities.isType(taDependencies, "Array") || taDependencies.length == 0 ? toCallback : null,
                    loadedCallback : g_oDromos.utilities.isType(taDependencies, "Array") && taDependencies.length > 0 ? toCallback : null
                };
            }
            else
            {
                // A named function with callbacks
                console.error("DEFINE CALLBACK FUNCTION");
            }
        }
        return;
    }
    g_oBase["define"].amd = {jQuery:true};

    // Define the configuration function
    g_oBase["require"].config = function(toConfig){
        // Loop through all of the properties and set them
        for (var lcProperty in toConfig)
        {
            if (lcProperty === "debug")
            {
                g_oBase.console.log = function(tcMessage){g_oBase.console.m_oConsole.log(tcMessage);};
                g_oBase.console.error = function(tcMessage){g_oBase.console.m_oConsole.error(tcMessage);};
                g_oBase.console.debug = toConfig[lcProperty] ? function(tcMessage){g_oBase.console.m_oConsole.log(tcMessage);} : function(){};
            }
            else if (lcProperty === "paths")
            {
                for (var lcPath in toConfig.paths)
                {
                    g_oDromos.Bootstrap.setPath(lcPath, toConfig.paths[lcPath]);
                }
            }
            else
            {
                g_oDromos.Bootstrap[lcProperty] = toConfig[lcProperty];
            }
        }
    };

    // ROOT is based on the location of the dromos script, this is only used for the
    // default configuration which is why it is declared here and not at the top.
    var __ROOT__ = g_oDromos.utilities.getScript("dromos.bootstrap.js");
    __ROOT__ = __ROOT__ ? __ROOT__.src.substring(0, __ROOT__.src.indexOf("dromos.bootstrap.js")) : "./";
    // Default configuration
    require.config({
        version : __VERSION__,
        debug : __DEBUG__,
        baseUrl : __ROOT__,
        paths : {
            "underscore" : __ROOT__ + "lib/underscore.js?minify=false",
            "backbone" : __ROOT__ + "lib/backbone-min.js?minify=false",
            "jquery" : __ROOT__ + "lib/jquery.min.js?minify=false;",
            "jqueryui" : __ROOT__ + "lib/jquery-ui.min.js?minify=false"
            }
    });
    // User config, if defined
    if (g_oDromos.utilities.isType(m_oOldRequire, "Object"))
    {
        require.config(m_oOldRequire);
    }

    // Load the default dromos library
    require(["underscore", "jquery", "backbone"], function(toUnderscore, jQuery, bb)
    {
        // Clean up the namespaces
        g_oDromos.$jQ = jQuery.noConflict();
        g_oDromos._ = _.noConflict();
        g_oDromos.$bb = Backbone.noConflict();

        define("dromos.bootstrap", g_oDromos);
        define("underscore", [], function(){return g_oDromos._;});
        define("backbone", [], function(){return g_oDromos.$bb;});

        // This is here instead of in the require as the setup above needs to take place to 
        // allow jquery, underscore, and backbone to take part in amd loading
        require(["jqueryui", "order!dromos"], function(){
            define("jqueryui", g_oDromos.$jQ);
        });
    });
    
})(this);
