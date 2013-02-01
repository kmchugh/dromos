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

    require.config({'property1' : 4});

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
    require(["testModule/module1"], function(toModule1)
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

    define("mydefine_inline_module", function(){return function(){return loModuleDefinition;}});

    QUnit.stop();
    require(["mydefine_inline_module"], function(toInlineModule)
    {
        QUnit.equal(toInlineModule(), loModuleDefinition);

        QUnit.start();
    });


});

test("DEFINE INLINE OBJECT TEST", function()
{
    var loModuleDefinition = {};

    define("mydefine_inline_object", function(){return loModuleDefinition;});

    QUnit.stop();
    require(["mydefine_inline_object"], function(toInlineModule)
    {
        QUnit.equal(toInlineModule, loModuleDefinition);

        QUnit.start();
    });
});

test("DEFINE INCLUDED OBJECT TEST", function()
{
    QUnit.stop();
    require(["testModule/module1"], function(toModule1)
    {
        QUnit.equal(toModule1.text, "my module 1");
        QUnit.equal(toModule1.value, 23);
        QUnit.start();
    });
});

test("DEFINE INCLUDED FUNCTION TEST", function()
{
    QUnit.stop();
    require(["testModule/module2"], function(toModule2)
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





