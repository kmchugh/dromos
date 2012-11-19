module("DROMOS BOOTSTRAP MODULE");

// And set up the path for the test modules
require.config({
    "paths" : {"testModule" : "test/modules"}
});

/**
 * Test ensures the require.config method is correctly setting properties on the Bootstrap object
 */
test("REQUIRE : config", function()
{
    require.config({
            "property1" : 1,
            "property2" : 2,
            "property3" : 3,
            "property4" : 4
            });

    QUnit.equal(dromos.Bootstrap['property1'], 1);
    QUnit.equal(dromos.Bootstrap['property2'], 2);
    QUnit.equal(dromos.Bootstrap['property3'], 3);
    QUnit.equal(dromos.Bootstrap['property4'], 4);

    require.config([{
            "property1" : 1,
            "property2" : 2,
            "property3" : 3,
            "property4" : 4
            }, {'property1' : 4}]);

    QUnit.equal(dromos.Bootstrap['property1'], 4);
    QUnit.equal(dromos.Bootstrap['property2'], 2);
    QUnit.equal(dromos.Bootstrap['property3'], 3);
    QUnit.equal(dromos.Bootstrap['property4'], 4);

});

/**
 * Test ensures getDromosRoot returns the same URL the bootstrap was loaded from
 */
test("BOOTSTRAP : getDromosRoot", function()
{
     var loDromosScriptTag = dromos.utilities.getScript("dromos.bootstrap.js");
     var lcDromosRootURL = dromos.utilities.getAttribute(loDromosScriptTag, 'dromos-root') || dromos.utilities.getAttribute(loDromosScriptTag, 'src').substring(0, loDromosScriptTag.src.indexOf("dromos.bootstrap.js"));

     QUnit.equal(lcDromosRootURL, dromos.Bootstrap.getDromosRoot());
     QUnit.ok(/.+\/$/.test(dromos.Bootstrap.getDromosRoot()));
});

/**
 * Test ensures getDefaultRoot returns the correct root and can be set through
 * require.config
 */
test("BOOTSTRAP : getBaseURI", function()
{
    var lcRoot = dromos.Bootstrap.getBaseURI();
    require.config({"baseURI" : "new/base/url"});
    QUnit.equal(dromos.Bootstrap.getBaseURI(), 'new/base/url/');
    QUnit.ok(/.+\/$/.test(dromos.Bootstrap.getBaseURI()));

    require.config({"baseURI" : "another/base/url/"});
    QUnit.equal(dromos.Bootstrap.getBaseURI(), 'another/base/url/');
    QUnit.ok(/.+\/$/.test(dromos.Bootstrap.getBaseURI()));

    require.config({"baseURI" : lcRoot});
    QUnit.equal(dromos.Bootstrap.getBaseURI(), lcRoot);
    QUnit.ok(/.+\/$/.test(dromos.Bootstrap.getBaseURI()));
});


/**
 * Ensures normaliseName returns the correct name for a module
 */
test("BOOTSTRAP : normaliseName", function()
{
    QUnit.equal(dromos.Bootstrap.normaliseName('jquery'), 'jquery');
    QUnit.equal(dromos.Bootstrap.normaliseName(['jquery']), 'jquery');
    QUnit.equal(dromos.Bootstrap.normaliseName(['jquery', 'bootstrap']), 'jquery|bootstrap');
});

test("BOOTSTRAP : setModule", function()
{
    var loModuleProxy = {getName : function(){return "module";}};

    dromos.Bootstrap.setModule(loModuleProxy);
    QUnit.equal(loModuleProxy, dromos.Bootstrap.getModule('module'));
});

test("BOOTSTRAP : getModule", function()
{
    var loModuleProxy = {getName : function(){return "module";}};

    dromos.Bootstrap.setModule(loModuleProxy);
    QUnit.equal(loModuleProxy, dromos.Bootstrap.getModule('module'));
    QUnit.equal(null, dromos.Bootstrap.getModule('Module does not exist'));
});

test("BOOTSTRAP : hasModule", function()
{
    var loModuleProxy = {getName : function(){return "HasModuleProxy";}};
    var loOtherModuleProxy = {getName : function(){return "HasModuleOtherProxy";}};
    dromos.Bootstrap.addModule(loModuleProxy);
    QUnit.ok(dromos.Bootstrap.hasModule(loModuleProxy));
    QUnit.ok(!dromos.Bootstrap.hasModule(loOtherModuleProxy));
});

test("BOOTSTRAP : loadModule", function()
{
    var loModule = null;
    loModule = dromos.Bootstrap.loadModule(['jquery']);
    QUnit.equal(loModule.getName(), 'jquery');
});

test("BOOTSTRAP : createModule", function()
{
    QUnit.ok(!dromos.Bootstrap.hasModule('myCreateModuleTestModule'));

    var loDef = {};
    loModule = dromos.Bootstrap.createModule('myCreateModuleTestModule', loDef);

    QUnit.ok(loModule.isLoaded());
    QUnit.ok(dromos.Bootstrap.hasModule('myCreateModuleTestModule'));

    loModule = dromos.Bootstrap.createModule('myCreateModuleTestModule_nodef');
    QUnit.ok(!loModule.isLoaded());
});

test("BOOTSTRAP : addModule", function()
{
    var loModuleProxy = {getName : function(){return dromos.Bootstrap.normaliseName("addModuleProxyModule");}};

    dromos.Bootstrap.addModule(loModuleProxy);
    QUnit.equal(loModuleProxy, dromos.Bootstrap.getModule('addModuleProxyModule'));
    QUnit.throws(function()
    {
        dromos.Bootstrap.addModule(loModuleProxy);
    }, "Adding module to dromos a second time");
});

test("BOOTSTRAP : setPath", function()
{
    dromos.Bootstrap.setPath("myModule", 'my/custom/path');
    QUnit.equal(dromos.Bootstrap.baseURI + 'my/custom/path', dromos.Bootstrap.getPath('myModule'));
});

test("BOOTSTRAP : getPath", function()
{
    dromos.Bootstrap.setPath("myModule", 'my/custom/path');
    QUnit.equal(dromos.Bootstrap.baseURI + 'my/custom/path', dromos.Bootstrap.getPath('myModule'));
    QUnit.equal(dromos.Bootstrap.getBaseURI() + 'myUndefinedModule', dromos.Bootstrap.getPath('myUndefinedModule'));

    QUnit.equal(dromos.Bootstrap.baseURI + 'my/custom/path/object/test', dromos.Bootstrap.getPath('myModule/object/test'));

    QUnit.equal('/myModule/object/test?version='+dromos.Bootstrap["version"], dromos.Bootstrap.getPath('/myModule/object/test'));



    QUnit.equal('path/to/myUndefinedModule', dromos.Bootstrap.getPath('myUndefinedModule', 'path/to/'));
});

test("BOOTSTRAP : getDefaultPlugin", function()
{
    var loPlugin = dromos.Bootstrap.getDefaultPlugin();
    QUnit.ok(loPlugin !== null);
    QUnit.equal(loPlugin, dromos.Bootstrap.getDefaultPlugin());
});

/**
 * Tests that the module can be correctly constructed
 */
test("MODULE CONSTRUCTOR TEST", function()
{
    var loModule = null;

    QUnit.throws(function()
            {
                loModule = new dromos.Bootstrap.Module();
            },
            "Array not supplied to Module"
        );

    QUnit.throws(function()
            {
                loModule = new dromos.Bootstrap.Module("A non-array parameter");
            },
            "Array not supplied to Module"
        );

    QUnit.throws(function()
            {
                loModule = new dromos.Bootstrap.Module([]);
            },
            "Array not supplied to Module"
        );

    loModule = new dromos.Bootstrap.Module(['jquery1']);
    QUnit.equal(loModule.getName(), "jquery1");
    QUnit.ok(!loModule.hasCallbacks());

    loModule = new dromos.Bootstrap.Module(['underscore', 'backbone']);
    QUnit.equal(loModule.getName(), "underscore|backbone");
    QUnit.ok(!loModule.hasCallbacks());

    QUnit.throws(function()
    {
        loModule = new dromos.Bootstrap.Module(['jquery1'], function(){});
    },
    "Module already exists");
});

test("MODULE : addCallback", function()
{
    var loCallback= function(){};
    var loModule = new dromos.Bootstrap.Module(["addCallbackTestModule"], loCallback);

    QUnit.equal(loCallback, loModule.getCallbacks()[0]);
});

test("MODULE : getResources", function()
{
    var laScripts = ["getScriptsTestModule"];
    var loModule = new dromos.Bootstrap.Module(laScripts);

    QUnit.equal(laScripts, loModule.getResources());
});

test("MODULE : load", function()
{
    var loDef = {};
    loModule = dromos.Bootstrap.createModule('myLoadModuleTestModule');
    QUnit.ok(!loModule.isLoading());
    QUnit.ok(!loModule.isLoaded());

    loModule.load();
    QUnit.ok(loModule.isLoading());
    QUnit.ok(!loModule.isLoaded());
});



module("DROMOS BOOTSTRAP REQUIRE MODULE");

test("REQUIRE INLINE TEST", function()
{
    QUnit.equal(require('jquery'), dromos.$jQ);
});

/**
 * After dromos has loaded, jquery, jqueryui, backbone, and underscore should also have been loaded
 * @return {[type]} [description]
 */
test("REQUIRE BASE TEST", function()
{
    QUnit.stop();

    require(["jquery", "underscore", "backbone"], function($jQ, $_, $bb)
    {
        QUnit.equal(dromos.$jQ, $jQ);
        QUnit.equal(dromos._, $_);
        QUnit.equal(dromos.$bb, $bb);
        QUnit.start();
    });
});


test("REQUIRE EXTERNAL LOAD TEST", function()
{
    QUnit.stop();
    require("testModule/module1", function(toModule1)
    {
        QUnit.equal(toModule1.text, "my module 1");
        QUnit.equal(toModule1.value, 23);
        QUnit.start();
    });
});

test("REQUIRE DEPENDENCY TEST", function()
{
    QUnit.stop();
    require(["testModule/module1", "testModule/module2"], function(toModule1, toModule2)
    {
        QUnit.equal(toModule1.value + toModule2.value, 69);
        QUnit.start();
    });
});

module("DROMOS BOOTSTRAP DEFINE MODULE");


test("DEFINE INLINE FUNCTION TEST", function()
{
    var loModuleDefinition = {};
    var loFunction = function(){return loModuleDefinition;};

    define("mydefine_inline_module", loFunction);

    QUnit.equal(require('mydefine_inline_module'), loModuleDefinition);
});

test("DEFINE INLINE OBJECT TEST", function()
{
    var loModuleDefinition = {};
    define("mydefine_inline_Object_module", loModuleDefinition);

    QUnit.equal(require('mydefine_inline_Object_module'), loModuleDefinition);
});

test("DEFINE INCLUDED OBJECT TEST", function()
{
    QUnit.stop();
    require("testModule/module1", function(toModule1)
    {
        QUnit.equal(toModule1.text, "my module 1");
        QUnit.equal(toModule1.value, 23);
        QUnit.start();
    });
});

test("DEFINE INCLUDED FUNCTION TEST", function()
{
    QUnit.stop();
    require("testModule/module2", function(toModule2)
    {
        QUnit.equal(toModule2.text, "my module 2");
        QUnit.equal(toModule2.value, 46);
        QUnit.start();
    });
});


test("DEFINE DEPENDENCY TEST", function()
{
    QUnit.stop();
    require(["testModule/module3"], function(toModule3)
    {
        QUnit.equal(toModule3.value, 69);
        QUnit.start();
    });
});





