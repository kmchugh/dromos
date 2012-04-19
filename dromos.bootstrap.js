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

	var __VERSION__ = 0.15; // Version number, used in .js urls, so cache busting can be done by changing
	var __DEBUG__ = false; // debug mode.  Can be configured by calling require.config({debug : true});

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

    	// The list of loaded plugins
    	var m_oPlugins = {};
    	
    	// The bootstrap object
    	return {
    		/**
    		* Loads the modules specified and calls the callback specified when the
    		* load is complete.
    		* taModules is an array of paths to the individual modules, paths can be
    		* absolute or relative based on the root directory. 
    		* e.g. dromos.Bootstrap.loadModule("dromos.utilities");
    		*      dromos.Bootstrap.loadModule("myModuleDir/myModule");
    		*      dromos.Bootstrap.loadModule("../myModuleDir/myModule");
    		*/
    		loadModule : function(taModules, toCallback)
    		{
    			var llModule = g_oDromos.utilities.isType(taModules, "Array");
    			taModules = llModule ? taModules : [taModules];

    			// Define a module name, the name is used to create unique module objects
    			var lcModuleName = llModule ?
    				(this.getModule(taModules.toString()) == null ?
                            "[" + taModules.toString() + "]" : taModules.toString()) :
                        taModules[0];

                g_oBase.console.debug("Loading " + lcModuleName);

                // Check if the module already exists
                var loModule = this.getModule(lcModuleName) || g_oDromos.Bootstrap.addModule({
                                name : llModule ? lcModuleName : taModules[0],
                                dependencies : llModule ? taModules : [],
                                composition: llModule});
                if (toCallback)
                {
                	loModule.insertLoadedCallback(99, toCallback);
                }
                loModule.plugin.load(loModule);
                return loModule;
    		},

    		/**
    		* Retrieves the module specified.  toModule can either be a module or a module name
    		*/
    		getModule : function(toModule)
    		{
	    		return m_oModules[g_oDromos.utilities.isType(toModule, 'String') ? 
	    			g_oDromos.Bootstrap.Module.extractInfo(toModule).name : 
	    			toModule.getName()] || null;
	   		},

    		/**
    		* Adds the module specified to the list of modules that will be loaded.  Adding the same
    		* module multiple times will have no effect.
    		* toModuleDef should be an object with a name and dependencies properties
    		*/
    		addModule : function(toModuleDef)
    		{
    			var loModule = this.getModule(toModuleDef.name);
    			if (loModule == null)
    			{
    				// Create the module and add it as it does not already exist
    				loModule = new g_oDromos.Bootstrap.Module(
	    				{
	    					name : toModuleDef.name,
	    					dependencies : toModuleDef.dependencies,
	    					composition : toModuleDef.composition,
	    					definition : toModuleDef.definition
	    				});
	    			m_oModules[loModule.getName()] = loModule;
	    			g_oBase.console.debug("Added module " + loModule.getName());
    			}
    			else
    			{
    				// Module exists already so this is most likely a definition modification
                    if (loModule.required)
                    {
                        loModule.required = false;
                    }
                    else
                    {
        				g_oBase.console.debug("Adjusting Module " + toModuleDef.name);
        				if (toModuleDef.definition)
        				{
        					loModule.setDefinition(loModule.plugin.resolveDefinition(loModule, toModuleDef.definition));
        				}
        				// Add any new dependencies
        				for (var i=0, lnLength=toModuleDef.dependencies.length; i<lnLength; i++)
                        {
                            loModule.addDependency(toModuleDef.dependencies[i]);
                        }
                        // Complete the module as it has now been defined
                        loModule.complete();
                    }
    			}
    			return loModule;
    		},

    		// Gets/sets the full path for the module specified
            getPath : function(tcModuleName, tcModulePath){return m_oPaths[tcModuleName] || tcModulePath + tcModuleName.replace(/^.+\//g, "");},
            setPath : function(tcModuleName, tcModulePath){m_oPaths[tcModuleName] = tcModulePath;},

    		// Gets the root directory to looking for modules in, or to base relative urls from
    		getDefaultRoot : function(){return g_oDromos.Bootstrap["baseUrl"];},

    		// Gets the specified plugin, if the plugin does not exist, then loads the plugin
    		getPlugin : function(tcPlugin)
    		{
    			// If the plugin name is 'default' use the default plugin
    			if (!m_oPlugins[tcPlugin])
    			{
    				if (/^default$/i.test(tcPlugin))
    				{
    					m_oPlugins[tcPlugin] = new g_oDromos.Bootstrap.Plugin();
    				}
    				else
    				{
    					// Load the plugin
    				}
    			}
    			return m_oPlugins[tcPlugin];
    		}

    	};
    })(toBase);

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
			var m_lComposition;
			var m_aDependencies = [];
			var m_aParents = [];
			var m_aLoadedCallbacks = [];
			var m_oTag;

			var m_lIsCompleted;

			// Gets the name of the module
			this.getName = function(){return m_cName;};

			// Gets the path of this module
			this.getPath = function(){return m_cPath;};

			// Adds a parent module, a parent module is a module that depends on this module
			this.addParent = function(toModule){m_aParents.push(toModule);};

			this.getParents = function(){return m_aParents};

			// Gets the definition for this module, the defenition is the object the module represents
			this.getDefinition = function(){return m_oDefinition;};
			this.setDefinition = function(toDefinition){g_oBase.console.debug("modifying definition of " + this.getName());m_oDefinition = toDefinition;}

			// Checks if this module has completed loading
			this.isCompleted = function(){return m_lIsCompleted && (this.isLoading() || this.isComposition())};
			this.setCompleted = function(){g_oBase.console.debug("Completing module " + this.getName());m_lIsCompleted = true;};

			// Checks if this module a composition of other modules
			this.isComposition = function(){return m_lComposition};
			this.setComposition = function(tlComposition){m_lComposition = tlComposition;};

			// Adds a dependency to this module
			this.addDependency = function(tcName)
			{
				var loInfo = g_oDromos.Bootstrap.Module.extractInfo(tcName);
				var lnIndex = this.indexOf(loInfo.name);
                if (lnIndex < 0)
                {
                    console.debug("Adding dependency " + loInfo.name + " to " + this.getName());
                    m_aDependencies.push(loInfo.name);

                    var loModule = g_oDromos.Bootstrap.addModule(
	                    {
	                        name : tcName,
	                        dependencies : []
	                    });
                    loModule.addParent(this);

                    var lcPlugin = loInfo.plugin;
                    if (lcPlugin != "")
                    {
                        // TODO: Adjust model to allow multiple plugins, e.g. order!text!
                        lcPlugin = "dromos.bootstrap." + lcPlugin;
                        console.debug("Using plugin `" + lcPlugin + "` to load " + loModule.getName());
                        // There is a plugin being loaded for this module, so don't allow a regular load
                        loModule.plugin = {load : function(){}};

                        // Load the plugin if needed
                        require(lcPlugin,
                            function(toPlugin){
                                    console.debug("Completed loading plugin " + lcPlugin);
                                    loModule.plugin = toPlugin;
                                    loModule.plugin.load(loModule);
                                });
                    }
                }
			};

			// Gets all of the dependencies for this module
			this.getDependencies = function(){return m_aDependencies;};

			// Gets the index of the specified dependency
            this.indexOf = function(tcModule){return m_aDependencies.indexOf(tcModule);};

            /**
             * Checks if this module has been marked as loaded, loaded means
             * any scripts have been attached, or a definition has been added
             */
            this.isLoading = function(){return this.getTag() != null || m_oDefinition != null};

            // GET/SET the script tag that is associated with this module
            this.setTag = function(toTag){m_oTag = toTag;};
            this.getTag = function(){return m_oTag;};

            // Gets an array of dependency objects which can be passed to a callback
            this.getCallbackArguments = function()
            {
                var laDependencies = this.getDependencies();
                var loArgs = [this.getDefinition()];
                for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
                {
                    if (laDependencies[i] === "require")
                    {
                        g_oBase.console.debug("REQUIRE!");
                        loArgs[i+1] = {};
                    }
                    else if (laDependencies[i] === "exports")
                    {
                        g_oBase.console.debug("exports!");
                        loArgs[i+1] = {};
                    }
                    else if (laDependencies[i] === "module")
                    {
                        g_oBase.console.debug("module!");
                        loArgs[i+1] = {
                            id:this.getName(),
                            uri:this.getURL(),
                            exports:{}
                        };
                    }
                    else
                    {
                        loArgs[i+1] = g_oDromos.Bootstrap.getModule(laDependencies[i]).getDefinition();
                    }
                    console.debug("pushed " + laDependencies[i] + "\n" + " to argument " + (i+1));
                }
                return loArgs;
            }

            // Inserts a callback at the specified index
            this.insertLoadedCallback = function(tnIndex, toCallback)
            {
                if (!toCallback) {return;}
                
                tnIndex = tnIndex < 0 ? 0 : tnIndex;
                tnIndex = tnIndex > m_aLoadedCallbacks.length ? m_aLoadedCallbacks : tnIndex;
                
                g_oBase.console.debug("Adding callback at index " + tnIndex + " to " + this.getName());
                
                if (m_aLoadedCallbacks.indexOf(toCallback) < 0)
                {
                    m_aLoadedCallbacks.splice(tnIndex, 0, toCallback);
                }
                
                // If the module is already completed then just execute the callbacks
                if (this.isCompleted())
                {
                    g_oBase.console.debug("Module is completed, executing callbacks");
                    this.executeLoadedCallbacks();
                }
            };

            // This executes the callbacks when this module is completely loaded
            this.executeLoadedCallbacks = function()
            {
                g_oBase.console.debug("Executing callbacks for " + this.getName());
                for (var i=0, lnLength = m_aLoadedCallbacks.length; i<lnLength; i++)
                {
                    var laArgs = this.getCallbackArguments();
                    laArgs = this.isComposition() && !this.getDefinition() ? laArgs.splice(1, laArgs.length) : laArgs;
                    g_oBase.console.debug("Executing" + (this.isComposition() ? " Composition " : "") + " module " + this.getName() + " callback " + (i + 1) + "/" + lnLength + "\n\targs: [" + laArgs + "]");
                    try
                    {
                        var loResult = m_aLoadedCallbacks[i].apply(this, laArgs);
                        if (loResult && !this.getDefinition())
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

			// Initialisation function
			var loInfo = g_oDromos.Bootstrap.Module.extractInfo(toModule.name);
			m_cName = (toModule.composition ? toModule.name : loInfo.name).toLowerCase();
			m_cPath = loInfo.path;
			m_oDefinition = toModule.definition || null;
			m_lComposition = toModule.composition ? true : false;
			this.plugin = g_oDromos.Bootstrap.getPlugin("default");
			
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
			var llComposition = !g_oDromos.utilities.isType(tcModuleURL, "String");
            tcModuleURL = (llComposition ? tcModuleURL.toString() : tcModuleURL).toLowerCase();
            var loInfo = null;
            if (/^\[.+/.test(tcModuleURL))
            {
                loInfo = {
                    name : tcModuleURL,
                    path : "",
                    plugin : ""
                    };
            }
            else
            {
                loInfo = {
                    name : ((llComposition ? tcModuleURL : tcModuleURL.replace(/^.+!|.js$/g, "")).replace(g_oDromos.Bootstrap.getDefaultRoot(), "")).toLowerCase(),
                    path : llComposition ? "" : tcModuleURL.replace(/^.+!|[^/]+(.js)?$|^http[s]?:\/\/[^/]+/g, ""),
                    plugin : llComposition ? "" : tcModuleURL.replace(/!?[^!]+$/g, "")
                    };
                loInfo.path = (/^[./]/.test(loInfo.path)) ? loInfo.path : g_oDromos.Bootstrap.getDefaultRoot() + loInfo.path;
            }
            return loInfo;
		};
		
		return loModuleDefinition;	
	})();

	g_oDromos.Bootstrap.Module.prototype = {
		/**
         * This will load all of the dependencies for this module, this will
         * return true if there is still a lock in place after this call
         */
        loadDependencies : function()
        {
            console.debug("Loading dependencies for " + this.getName());
            var laDependencies = this.getDependencies();
            var llLoadingLocked = false;

            // Attempt to load each dependency that is not synch locked
            for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
            {
                var lcDependency = laDependencies[i];
                // Get the module
                var loModule = g_oDromos.Bootstrap.getModule(lcDependency);
                if (!loModule.isLoading())
                {
                    console.debug("Loading module " + loModule.getName());
                    loModule.plugin.load(loModule);
                }
            }
            return llLoadingLocked;
        },

        // GETS the URL for this module
        getURL : function()
        {
            return g_oDromos.utilities.cleanURL(g_oDromos.Bootstrap.getPath(this.getName(), this.getPath()));
        },
        // Attempts to complete the loading of this module
        complete : function()
        {
            // This can only be set as complete if all the dependencies are loaded
            var laDependencies = this.getDependencies();

            g_oBase.console.debug("Checking dependencies for " + this.getName());
            for (var i=0, lnLength = laDependencies.length; i<lnLength; i++)
            {
                var loModule = g_oDromos.Bootstrap.getModule(laDependencies[i]);
                if (!loModule.isLoading())
                {
                    g_oBase.console.debug(loModule.getName() + " has not started loading yet");
                    this.loadDependencies()
                    return;
                }
                else if (!loModule.isCompleted())
                {
                    g_oBase.console.debug(loModule.getName() + " is not yet completed");
                    return;
                }
            }

            g_oBase.console.debug("Dependency check complete for " + this.getName());
            if (!this.isCompleted())
            {
                this.setCompleted();
                if (this.isCompleted())
                {
                    this.executeLoadedCallbacks();

                    // Load any dependent parents
                    var laParents = this.getParents();
                    for (i=0, lnLength = laParents.length; i<lnLength; i++)
                    {
                        if (!laParents[i].isCompleted())
                        {
                            laParents[i].complete();
                        }
                    }
                    this.plugin.onCompleted(this);
                }
            }
        },
		
	};


	// Default plugin, any plugins should inherit from this object, by default this plugin will load
	// .js files
	g_oDromos.Bootstrap.Plugin = function(){
		return {
			// Loads the module specified if it is not already loaded
			load : function(toModule){
				if ((toModule.isComposition() || !toModule.isLoading()) && !toModule.isCompleted())
	            {
	                if (!toModule.loadDependencies())
	                {
	                    // The dependencies have loaded and there are no locks in place
	                    if (toModule.isComposition())
	                    {
	                        g_oBase.console.debug("Starting Composition load for " + toModule.getName());
	                        // No script needed, we are complete
	                        toModule.complete();
	                    }
	                    else
	                    {
	                        g_oBase.console.debug("Starting script load for " + toModule.getName());
	                        this.addScriptTag(toModule);
	                    }
	                }
	            }
			},
			/***
	         * Adds the script tag to the page
	         */
			addScriptTag : function(toModule)
			{
	            if (!toModule.isComposition() && !toModule.getTag())
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
		                loTag.src = lcURL;
		                loTag.type = "text/javascript";
		                loTag.charset = "utf-8";
		                loTag.async = true;
		                loTag.module = toModule;
		                toModule.setTag(loTag);
		                g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptLoaded, typeof(loTag.readyState) != 'undefined' ? "readystatechange" : "load");
		                g_oDromos.utilities.addEventListener(loTag, toModule.plugin.onScriptError, "error");
		                document.getElementsByTagName("head")[0].appendChild(loTag);
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
	            if (toEvent.type === "load" || (loTag && /^(complete|loaded)$/.test(loTag.readyState)));
	            {
	                var loModule = loTag.module;
	                var loOutstanding = g_oDromos.Bootstrap.outstanding;
	                g_oDromos.Bootstrap.outstanding = undefined;

	                g_oBase.console.debug("Script loaded for module " + loModule.getName());
	                if (toEvent.type === "load" || loTag.readyState === "loaded" || loTag.readyState === "complete")
	                {
	                    g_oBase.console.debug("Anonymous script found - " + loTag.src);
	                    if (loOutstanding)
	                    {
	                        g_oBase.console.debug("Linking Anonymous script");
	                        if (loOutstanding.dependencies)
	                        {
	                            for (var i=0, lnLength = loOutstanding.dependencies.length; i<lnLength; i++)
	                            {
	                                loModule.addDependency(loOutstanding.dependencies[i]);
	                            }
	                        }
	                        loModule.setComposition(true);
	                        loModule.insertLoadedCallback(0, loOutstanding.definition);
	                    }

	                    g_oDromos.utilities.removeEventListener(loTag, loTag.detachEvent ? "readystatechange" : "load", this.onScriptLoaded);
	                    g_oDromos.utilities.removeEventListener(loTag, "error", this.onScriptError);
	                    loTag.module = null;
	                    loModule.complete();
	                }
	            }
	        },
	        // Resolved the definition supplied into a value
	        resolveDefinition : function(toModule, toDefinition)
	        {
	            if (g_oDromos.utilities.isType(toDefinition, "Function"))
	            {
	                // Update the status
	                var loArgs = toModule.getCallbackArguments();
	                g_oBase.console.debug("Resolving Definition for " + toModule.getName());
	                return toDefinition.apply(toModule.getDefinition(), loArgs.length > 1 ? loArgs.splice(1) : [toModule.getDefinition()]);
	            }
	            return toDefinition;
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
		var loModule = g_oDromos.Bootstrap.loadModule(taModules, toCallback);
        if (loModule != null)
        {
            var loDef = loModule.getDefinition();
            if (loDef == null)
            {
                loModule.required = true;
            }
            return loDef;
        }
        return null;
	};

	// Define the define function, clobbers any existing define
	g_oBase["define"] = function(tcModuleName, taDependencies, toCallback)
	{
		var llComposition = !g_oDromos.utilities.isType(tcModuleName, "String");
        // Sort out all of the arguments
        if (llComposition)
        {
            // Shift all of the arguments
            toCallback = taDependencies;
            taDependencies = tcModuleName;
            tcModuleName = null;
        }
        if (!g_oDromos.utilities.isType(taDependencies, "Array"))
        {
            toCallback = taDependencies;
            taDependencies = [];
        }

        if (llComposition)
        {
            g_oBase.console.debug("DEFINE - storing anonymous module");
            // Store the composition module
            g_oDromos.Bootstrap.outstanding = {
                    name : tcModuleName,
                    dependencies : taDependencies,
                    definition : toCallback
                };
        }
        else
        {
            g_oBase.console.debug("DEFINING : " + tcModuleName);
            var loModule = g_oDromos.Bootstrap.addModule({
                name:tcModuleName,
                composition : true,
                dependencies: taDependencies,
                definition : toCallback});
            if (!loModule.isCompleted())
            {
                loModule.insertLoadedCallback(toCallback);
                loModule.plugin.load(loModule);
            }
        }
	}
	g_oBase["define"].amd = {};

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
			"jquery" : __ROOT__ + "lib/jquery.min.js?minify=false;"
		}
	});
	// User config, if defined
	if (g_oDromos.utilities.isType(m_oOldRequire, "Object"))
	{
		require.config(m_oOldRequire);
	}

	// Load the default dromos library
	require(["underscore", "jquery", "backbone"], function(dromos)
	{
		// Clean up the namespaces
		g_oDromos.$jQ = jQuery.noConflict();
		g_oDromos._ = _.noConflict();
		g_oDromos.$bb = Backbone.noConflict();
		
		define("jquery", [], function(){return g_oDromos.$jQ;});
		define("underscore", [], function(){return g_oDromos._;});
		define("backbone", [], function(){return g_oDromos.$bb;});

        // This is here instead of in the require as the setup above is required for dromos
		require(["order!dromos"], function(){});
	});
	
})(this);