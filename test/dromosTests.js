module("DROMOS MODULE");

test("DROMOS LOADED TEST", function()
{
    QUnit.notEqual(dromos, null);
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
        QUnit.equal(dromos._, $_);
        QUnit.equal(dromos.$bb, $bb);
        QUnit.equal(dromos.$jQ, $jQ);

        QUnit.start();
    });
});