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
// TODO: Add ability to specify what happens if a module can not load by adding a second function parameter to require
=============================*/


// Only allow dromos to be initialised once
if (!this["_dromos_initialised"])
{
    this["_dromos_initialised"] = true;
    (function(toBase) {
        var __VERSION__ = 0.33; // Version number, used in .js urls, so cache busting can be done by changing
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
            }
        };

        // Define the bootstrap
        g_oDromos.Bootstrap = (function(toBase)
        {
            var m_oDromosScriptTag = g_oDromos.utilities.getScript("dromos.bootstrap.js");
            var m_cDromosRootURL = dromos.utilities.getAttribute(m_oDromosScriptTag, 'dromos-root') || dromos.utilities.getAttribute(m_oDromosScriptTag, 'src').substring(0, m_oDromosScriptTag.src.indexOf("dromos.bootstrap.js"));
            var m_cDromosBaseURL = dromos.utilities.getAttribute(m_oDromosScriptTag, 'dromos-base') || (m_cDromosRootURL+'../../');
            // The bootstrap object
            return {
                baseURI : m_cDromosBaseURL,

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
          };
     })(toBase);


        /*****************************************************************************
         * REQUIRE AND CONFIGURATION
        *****************************************************************************/

        // Define the require function, clobbers any existing require,
        // if a require exists but is an object, it will be stored and used
        // as a configuration object
        var loConfig = {
                version : __VERSION__,
                debug : __DEBUG__,
                baseUrl : g_oDromos.Bootstrap.getBaseURI(),
                paths : {
                    'dromos': g_oDromos.Bootstrap.getDromosRoot() + 'dromos',
                    'dromos.utilities': g_oDromos.Bootstrap.getDromosRoot() + 'dromos.utilities',
                    'underscore' :  g_oDromos.Bootstrap.getDromosRoot() + 'lib/underscore',
                    'backbone' :  g_oDromos.Bootstrap.getDromosRoot() + 'lib/backbone-min',
                    'jquery' :  g_oDromos.Bootstrap.getDromosRoot()+ 'lib/jquery.min',
                    'jqueryui' :  g_oDromos.Bootstrap.getDromosRoot() + 'lib/jquery-ui.min'
                },
                shim : {
                    'dromos' : {'deps' : ['jquery', 'underscore', 'backbone', 'jqueryui']},
                    'jqueryui' : {
                        'deps' : ['jquery'],
                        'init' : function()
                        {
                            g_oDromos.$jQ = jQuery.noConflict(true);
                            define("jquery", g_oDromos.$jQ);
                            define("jqueryui", g_oDromos.$jQ);
                        }
                    },
                    'backbone' : {
                        'deps' : ['underscore', 'jquery'],
                        'init' : function()
                        {
                            g_oDromos._ = _.noConflict();
                            define("underscore", [], function(){return g_oDromos._;});

                            g_oDromos.$bb = Backbone.noConflict();
                            define("backbone", [], function(){return g_oDromos.$bb;});
                        }
                    }

                }
            };

        /*
         RequireJS 2.1.2 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
         Available via the MIT or new BSD license.
         see: http://github.com/jrburke/requirejs for details
        */
        var requirejs,require,define;
        (function(Y){function H(b){return"[object Function]"===L.call(b)}function I(b){return"[object Array]"===L.call(b)}function x(b,c){if(b){var d;for(d=0;d<b.length&&(!b[d]||!c(b[d],d,b));d+=1);}}function M(b,c){if(b){var d;for(d=b.length-1;-1<d&&(!b[d]||!c(b[d],d,b));d-=1);}}function r(b,c){return da.call(b,c)}function i(b,c){return r(b,c)&&b[c]}function E(b,c){for(var d in b)if(r(b,d)&&c(b[d],d))break}function Q(b,c,d,i){c&&E(c,function(c,h){if(d||!r(b,h))i&&"string"!==typeof c?(b[h]||(b[h]={}),Q(b[h],
        c,d,i)):b[h]=c});return b}function t(b,c){return function(){return c.apply(b,arguments)}}function Z(b){if(!b)return b;var c=Y;x(b.split("."),function(b){c=c[b]});return c}function J(b,c,d,i){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=i;d&&(c.originalError=d);return c}function ea(b){function c(a,g,v){var e,n,b,c,d,j,f,h=g&&g.split("/");e=h;var l=m.map,k=l&&l["*"];if(a&&"."===a.charAt(0))if(g){e=i(m.pkgs,g)?h=[g]:h.slice(0,h.length-1);g=a=e.concat(a.split("/"));
        for(e=0;g[e];e+=1)if(n=g[e],"."===n)g.splice(e,1),e-=1;else if(".."===n)if(1===e&&(".."===g[2]||".."===g[0]))break;else 0<e&&(g.splice(e-1,2),e-=2);e=i(m.pkgs,g=a[0]);a=a.join("/");e&&a===g+"/"+e.main&&(a=g)}else 0===a.indexOf("./")&&(a=a.substring(2));if(v&&(h||k)&&l){g=a.split("/");for(e=g.length;0<e;e-=1){b=g.slice(0,e).join("/");if(h)for(n=h.length;0<n;n-=1)if(v=i(l,h.slice(0,n).join("/")))if(v=i(v,b)){c=v;d=e;break}if(c)break;!j&&(k&&i(k,b))&&(j=i(k,b),f=e)}!c&&j&&(c=j,d=f);c&&(g.splice(0,d,
        c),a=g.join("/"))}return a}function d(a){z&&x(document.getElementsByTagName("script"),function(g){if(g.getAttribute("data-requiremodule")===a&&g.getAttribute("data-requirecontext")===j.contextName)return g.parentNode.removeChild(g),!0})}function y(a){var g=i(m.paths,a);if(g&&I(g)&&1<g.length)return d(a),g.shift(),j.require.undef(a),j.require([a]),!0}function f(a){var g,b=a?a.indexOf("!"):-1;-1<b&&(g=a.substring(0,b),a=a.substring(b+1,a.length));return[g,a]}function h(a,g,b,e){var n,u,d=null,h=g?g.name:
        null,l=a,m=!0,k="";a||(m=!1,a="_@r"+(L+=1));a=f(a);d=a[0];a=a[1];d&&(d=c(d,h,e),u=i(p,d));a&&(d?k=u&&u.normalize?u.normalize(a,function(a){return c(a,h,e)}):c(a,h,e):(k=c(a,h,e),a=f(k),d=a[0],k=a[1],b=!0,n=j.nameToUrl(k)));b=d&&!u&&!b?"_unnormalized"+(M+=1):"";return{prefix:d,name:k,parentMap:g,unnormalized:!!b,url:n,originalName:l,isDefine:m,id:(d?d+"!"+k:k)+b}}function q(a){var g=a.id,b=i(k,g);b||(b=k[g]=new j.Module(a));return b}function s(a,g,b){var e=a.id,n=i(k,e);if(r(p,e)&&(!n||n.defineEmitComplete))"defined"===
        g&&b(p[e]);else q(a).on(g,b)}function C(a,g){var b=a.requireModules,e=!1;if(g)g(a);else if(x(b,function(g){if(g=i(k,g))g.error=a,g.events.error&&(e=!0,g.emit("error",a))}),!e)l.onError(a)}function w(){R.length&&(fa.apply(F,[F.length-1,0].concat(R)),R=[])}function A(a,g,b){var e=a.map.id;a.error?a.emit("error",a.error):(g[e]=!0,x(a.depMaps,function(e,c){var d=e.id,h=i(k,d);h&&(!a.depMatched[c]&&!b[d])&&(i(g,d)?(a.defineDep(c,p[d]),a.check()):A(h,g,b))}),b[e]=!0)}function B(){var a,g,b,e,n=(b=1E3*m.waitSeconds)&&
        j.startTime+b<(new Date).getTime(),c=[],h=[],f=!1,l=!0;if(!T){T=!0;E(k,function(b){a=b.map;g=a.id;if(b.enabled&&(a.isDefine||h.push(b),!b.error))if(!b.inited&&n)y(g)?f=e=!0:(c.push(g),d(g));else if(!b.inited&&(b.fetched&&a.isDefine)&&(f=!0,!a.prefix))return l=!1});if(n&&c.length)return b=J("timeout","Load timeout for modules: "+c,null,c),b.contextName=j.contextName,C(b);l&&x(h,function(a){A(a,{},{})});if((!n||e)&&f)if((z||$)&&!U)U=setTimeout(function(){U=0;B()},50);T=!1}}function D(a){r(p,a[0])||
        q(h(a[0],null,!0)).init(a[1],a[2])}function G(a){var a=a.currentTarget||a.srcElement,b=j.onScriptLoad;a.detachEvent&&!V?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=j.onScriptError;(!a.detachEvent||V)&&a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}function K(){var a;for(w();F.length;){a=F.shift();if(null===a[0])return C(J("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));D(a)}}var T,W,j,N,U,m={waitSeconds:7,
        baseUrl:"./",paths:{},pkgs:{},shim:{},map:{},config:{}},k={},X={},F=[],p={},S={},L=1,M=1;N={require:function(a){return a.require?a.require:a.require=j.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?a.exports:a.exports=p[a.map.id]={}},module:function(a){return a.module?a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){return m.config&&i(m.config,a.map.id)||{}},exports:p[a.map.id]}}};W=function(a){this.events=i(X,a.id)||{};this.map=a;this.shim=
        i(m.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};W.prototype={init:function(a,b,c,e){e=e||{};if(!this.inited){this.factory=b;if(c)this.on("error",c);else this.events.error&&(c=t(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.errback=c;this.inited=!0;this.ignore=e.ignore;e.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=
        b)},fetch:function(){if(!this.fetched){this.fetched=!0;j.startTime=(new Date).getTime();var a=this.map;if(this.shim)j.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],t(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=this.map.url;S[a]||(S[a]=!0,j.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var e=this.exports,n=this.factory;
        if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(H(n)){if(this.events.error)try{e=j.execCb(c,n,b,e)}catch(d){a=d}else e=j.execCb(c,n,b,e);this.map.isDefine&&((b=this.module)&&void 0!==b.exports&&b.exports!==this.exports?e=b.exports:void 0===e&&this.usingExports&&(e=this.exports));if(a)return a.requireMap=this.map,a.requireModules=[this.map.id],a.requireType="define",C(this.error=a)}else e=n;this.exports=e;if(this.map.isDefine&&
        !this.ignore&&(p[c]=e,l.onResourceLoad))l.onResourceLoad(j,this.map,this.depMaps);delete k[c];this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else this.fetch()}},callPlugin:function(){var a=this.map,b=a.id,d=h(a.prefix);this.depMaps.push(d);s(d,"defined",t(this,function(e){var n,d;d=this.map.name;var v=this.map.parentMap?this.map.parentMap.name:null,f=j.makeRequire(a.parentMap,{enableBuildCallback:!0,
        skipMap:!0});if(this.map.unnormalized){if(e.normalize&&(d=e.normalize(d,function(a){return c(a,v,!0)})||""),e=h(a.prefix+"!"+d,this.map.parentMap),s(e,"defined",t(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),d=i(k,e.id)){this.depMaps.push(e);if(this.events.error)d.on("error",t(this,function(a){this.emit("error",a)}));d.enable()}}else n=t(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),n.error=t(this,function(a){this.inited=!0;this.error=
        a;a.requireModules=[b];E(k,function(a){0===a.map.id.indexOf(b+"_unnormalized")&&delete k[a.map.id]});C(a)}),n.fromText=t(this,function(e,c){var d=a.name,u=h(d),v=O;c&&(e=c);v&&(O=!1);q(u);r(m.config,b)&&(m.config[d]=m.config[b]);try{l.exec(e)}catch(k){throw Error("fromText eval for "+d+" failed: "+k);}v&&(O=!0);this.depMaps.push(u);j.completeLoad(d);f([d],n)}),e.load(a.name,f,n,m)}));j.enable(d,this);this.pluginMaps[d.id]=d},enable:function(){this.enabling=this.enabled=!0;x(this.depMaps,t(this,function(a,
        b){var c,e;if("string"===typeof a){a=h(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[b]=a;if(c=i(N,a.id)){this.depExports[b]=c(this);return}this.depCount+=1;s(a,"defined",t(this,function(a){this.defineDep(b,a);this.check()}));this.errback&&s(a,"error",this.errback)}c=a.id;e=k[c];!r(N,c)&&(e&&!e.enabled)&&j.enable(a,this)}));E(this.pluginMaps,t(this,function(a){var b=i(k,a.id);b&&!b.enabled&&j.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=
        this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){x(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};j={config:m,contextName:b,registry:k,defined:p,urlFetched:S,defQueue:F,Module:W,makeModuleMap:h,nextTick:l.nextTick,configure:function(a){a.baseUrl&&"/"!==a.baseUrl.charAt(a.baseUrl.length-1)&&(a.baseUrl+="/");var b=m.pkgs,c=m.shim,e={paths:!0,config:!0,map:!0};E(a,function(a,b){e[b]?"map"===b?Q(m[b],a,!0,!0):Q(m[b],a,!0):m[b]=a});a.shim&&(E(a.shim,function(a,
        b){I(a)&&(a={deps:a});if((a.exports||a.init)&&!a.exportsFn)a.exportsFn=j.makeShimExports(a);c[b]=a}),m.shim=c);a.packages&&(x(a.packages,function(a){a="string"===typeof a?{name:a}:a;b[a.name]={name:a.name,location:a.location||a.name,main:(a.main||"main").replace(ga,"").replace(aa,"")}}),m.pkgs=b);E(k,function(a,b){!a.inited&&!a.map.unnormalized&&(a.map=h(b))});if(a.deps||a.callback)j.require(a.deps||[],a.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(Y,arguments));
        return b||a.exports&&Z(a.exports)}},makeRequire:function(a,d){function f(e,c,u){var i,m;d.enableBuildCallback&&(c&&H(c))&&(c.__requireJsBuild=!0);if("string"===typeof e){if(H(c))return C(J("requireargs","Invalid require call"),u);if(a&&r(N,e))return N[e](k[a.id]);if(l.get)return l.get(j,e,a);i=h(e,a,!1,!0);i=i.id;return!r(p,i)?C(J("notloaded",'Module name "'+i+'" has not been loaded yet for context: '+b+(a?"":". Use require([])"))):p[i]}K();j.nextTick(function(){K();m=q(h(null,a));m.skipMap=d.skipMap;
        m.init(e,c,u,{enabled:!0});B()});return f}d=d||{};Q(f,{isBrowser:z,toUrl:function(b){var d=b.lastIndexOf("."),g=null;-1!==d&&(g=b.substring(d,b.length),b=b.substring(0,d));return j.nameToUrl(c(b,a&&a.id,!0),g)},defined:function(b){return r(p,h(b,a,!1,!0).id)},specified:function(b){b=h(b,a,!1,!0).id;return r(p,b)||r(k,b)}});a||(f.undef=function(b){w();var c=h(b,a,!0),d=i(k,b);delete p[b];delete S[c.url];delete X[b];d&&(d.events.defined&&(X[b]=d.events),delete k[b])});return f},enable:function(a){i(k,
        a.id)&&q(a).enable()},completeLoad:function(a){var b,c,d=i(m.shim,a)||{},h=d.exports;for(w();F.length;){c=F.shift();if(null===c[0]){c[0]=a;if(b)break;b=!0}else c[0]===a&&(b=!0);D(c)}c=i(k,a);if(!b&&!r(p,a)&&c&&!c.inited){if(m.enforceDefine&&(!h||!Z(h)))return y(a)?void 0:C(J("nodefine","No define call for "+a,null,[a]));D([a,d.deps||[],d.exportsFn])}B()},nameToUrl:function(a,b){var c,d,h,f,j,k;if(l.jsExtRegExp.test(a))f=a+(b||"");else{c=m.paths;d=m.pkgs;f=a.split("/");for(j=f.length;0<j;j-=1)if(k=
        f.slice(0,j).join("/"),h=i(d,k),k=i(c,k)){I(k)&&(k=k[0]);f.splice(0,j,k);break}else if(h){c=a===h.name?h.location+"/"+h.main:h.location;f.splice(0,j,c);break}f=f.join("/");f+=b||(/\?/.test(f)?"":".js");f=("/"===f.charAt(0)||f.match(/^[\w\+\.\-]+:/)?"":m.baseUrl)+f}return m.urlArgs?f+((-1===f.indexOf("?")?"?":"&")+m.urlArgs):f},load:function(a,b){l.load(j,a,b)},execCb:function(a,b,c,d){return b.apply(d,c)},onScriptLoad:function(a){if("load"===a.type||ha.test((a.currentTarget||a.srcElement).readyState))P=
        null,a=G(a),j.completeLoad(a.id)},onScriptError:function(a){var b=G(a);if(!y(b.id))return C(J("scripterror","Script error",a,[b.id]))}};j.require=j.makeRequire();return j}var l,w,A,D,s,G,P,K,ba,ca,ia=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,ja=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,aa=/\.js$/,ga=/^\.\//;w=Object.prototype;var L=w.toString,da=w.hasOwnProperty,fa=Array.prototype.splice,z=!!("undefined"!==typeof window&&navigator&&document),$=!z&&"undefined"!==typeof importScripts,ha=z&&
        "PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,V="undefined"!==typeof opera&&"[object Opera]"===opera.toString(),B={},q={},R=[],O=!1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(H(requirejs))return;q=requirejs;requirejs=void 0}"undefined"!==typeof require&&!H(require)&&(q=require,require=void 0);l=requirejs=function(b,c,d,y){var f,h="_";!I(b)&&"string"!==typeof b&&(f=b,I(c)?(b=c,c=d,d=y):b=[]);f&&f.context&&(h=f.context);(y=i(B,h))||(y=B[h]=l.s.newContext(h));
        f&&y.configure(f);return y.require(b,c,d)};l.config=function(b){return l(b)};l.nextTick="undefined"!==typeof setTimeout?function(b){setTimeout(b,4)}:function(b){b()};require||(require=l);l.version="2.1.2";l.jsExtRegExp=/^\/|:|\?|\.js$/;l.isBrowser=z;w=l.s={contexts:B,newContext:ea};l({});x(["toUrl","undef","defined","specified"],function(b){l[b]=function(){var c=B._;return c.require[b].apply(c,arguments)}});if(z&&(A=w.head=document.getElementsByTagName("head")[0],D=document.getElementsByTagName("base")[0]))A=
        w.head=D.parentNode;l.onError=function(b){throw b;};l.load=function(b,c,d){var i=b&&b.config||{},f;if(z)return f=i.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script"),f.type=i.scriptType||"text/javascript",f.charset="utf-8",f.async=!0,f.setAttribute("data-requirecontext",b.contextName),f.setAttribute("data-requiremodule",c),f.attachEvent&&!(f.attachEvent.toString&&0>f.attachEvent.toString().indexOf("[native code"))&&!V?(O=!0,f.attachEvent("onreadystatechange",
        b.onScriptLoad)):(f.addEventListener("load",b.onScriptLoad,!1),f.addEventListener("error",b.onScriptError,!1)),f.src=d,K=f,D?A.insertBefore(f,D):A.appendChild(f),K=null,f;$&&(importScripts(d),b.completeLoad(c))};z&&M(document.getElementsByTagName("script"),function(b){A||(A=b.parentNode);if(s=b.getAttribute("data-main"))return q.baseUrl||(G=s.split("/"),ba=G.pop(),ca=G.length?G.join("/")+"/":"./",q.baseUrl=ca,s=ba),s=s.replace(aa,""),q.deps=q.deps?q.deps.concat(s):[s],!0});define=function(b,c,d){var i,
        f;"string"!==typeof b&&(d=c,c=b,b=null);I(c)||(d=c,c=[]);!c.length&&H(d)&&d.length&&(d.toString().replace(ia,"").replace(ja,function(b,d){c.push(d)}),c=(1===d.length?["require"]:["require","exports","module"]).concat(c));if(O){if(!(i=K))P&&"interactive"===P.readyState||M(document.getElementsByTagName("script"),function(b){if("interactive"===b.readyState)return P=b}),i=P;i&&(b||(b=i.getAttribute("data-requiremodule")),f=B[i.getAttribute("data-requirecontext")])}(f?f.defQueue:R).push([b,c,d])};define.amd=
        {jQuery:!0};l.exec=function(b){return eval(b)};l(q)}})(this);

        g_oBase.require = require;
        g_oBase.define = define;

        // Configure require
        require.config(loConfig);

        /*****************************************************************************
         * END REQUIRE AND CONFIGURATION
        *****************************************************************************/

        /**
         * And off we go
         * */
        require(['dromos'], function(dromos)
        {
            // Nothing to do.
        });
    })(this);
}
