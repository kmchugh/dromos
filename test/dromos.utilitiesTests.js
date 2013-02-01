module("DROMOS UTILITIES MODULE");

test("DROMOS UTILITIES LOADED TEST", function()
{
    QUnit.stop();

    require(["dromos"], function(dromos)
    {
        QUnit.notEqual(dromos.utilities, null);

        // Make sure a function exists that was not created by bootstrap
        QUnit.notEqual("".allTrim, null);

        QUnit.start();
    });



});
