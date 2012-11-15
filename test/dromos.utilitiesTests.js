module("DROMOS UTILITIES MODULE");

test("DROMOS UTILITIES LOADED TEST", function()
{
    QUnit.notEqual(dromos.utilities, null);

    // Make sure a function exists that was not created by bootstrap
    QUnit.notEqual("".allTrim, null);
});
