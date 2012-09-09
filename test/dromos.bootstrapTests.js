module("DROMOS BOOTSTRAP MODULE");

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
    console.error(lcRoot);
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
    QUnit.equal(dromos.Bootstrap.normaliseName(['jquery', 'bootstrap']), 'jquery_bootstrap');
});

test("BOOTSTRAP : setModule", function()
{
    var loModuleProxy = {getName : function(){return "Module";}};

    dromos.Bootstrap.setModule(loModuleProxy);
    QUnit.equal(loModuleProxy, dromos.Bootstrap.getModule('Module'));
});

test("BOOTSTRAP : getModule", function()
{
    var loModuleProxy = {getName : function(){return "Module";}};

    dromos.Bootstrap.setModule(loModuleProxy);
    QUnit.equal(loModuleProxy, dromos.Bootstrap.getModule('Module'));
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

test("BOOTSTRAP : addModule", function()
{
    var loModuleProxy = {getName : function(){return "addModuleProxyModule";}};

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
    QUnit.equal('my/custom/path', dromos.Bootstrap.getPath('myModule'));
});

test("BOOTSTRAP : getPath", function()
{
    dromos.Bootstrap.setPath("myModule", 'my/custom/path');
    QUnit.equal('my/custom/path', dromos.Bootstrap.getPath('myModule'));
    QUnit.equal(dromos.Bootstrap.getBaseURI() + 'myUndefinedModule', dromos.Bootstrap.getPath('myUndefinedModule'));

    QUnit.equal('path/to/myUndefinedModule', dromos.Bootstrap.getPath('myUndefinedModule', 'path/to/'));
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
    QUnit.equal(loModule.getName(), "underscore_backbone");
    QUnit.ok(!loModule.hasCallbacks());

    QUnit.throws(function()
    {
        loModule = new dromos.Bootstrap.Module(['jquery1'], function(){});
    },
    "Module already exists");
});



/**
 * After dromos has loaded, jquery, jqueryui, backbone, and underscore should also have been loaded
 * @return {[type]} [description]
 */
test("REQUIRE TEST", function()
{
    /*
    QUnit.stop();

     require(["jquery", "underscore", "backbone"], function($jQ, $_, $bb)
    {
        QUnit.equal(dromos.$jQ, $jQ);
        QUnit.equal(dromos._, $_);
        QUnit.equal(dromos.$bb, $bb);

        QUnit.start();
    });
     */
});



/*
require(['moda', 'modb', 'modc'],
    function($, canvas, sub)
    {
        // do something
    })

//Inside file my/shirt.js:
define({
    color: "black",
    size: "unisize"
});

//my/shirt.js now does setup work
//before returning its module definition.
define(function () {
    //Do setup work here

    return {
        color: "black",
        size: "unisize"
    }
});

//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
define(["./cart", "./inventory"], function(cart, inventory) {
        //return an object to define the "my/shirt" module.
        return {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        }
    }
);

//A module definition inside foo/title.js. It uses
//my/cart and my/inventory modules from before,
//but since foo/bar.js is in a different directory than
//the "my" modules, it uses the "my" in the module dependency
//name to find them. The "my" part of the name can be mapped
//to any directory, but by default, it is assumed to be a
//sibling to the "foo" directory.
define(["my/cart", "my/inventory"],
    function(cart, inventory) {
        //return a function to define "foo/title".
        //It gets or sets the window title.
        return function(title) {
            return title ? (window.title = title) :
                   inventory.storeName + ' ' + cart.name;
        }
    }
);

//Explicitly defines the "foo/title" module:
    define("foo/title",
        ["my/cart", "my/inventory"],
        function(cart, inventory) {
            //Define foo/title object in here.
       }
    );*/

