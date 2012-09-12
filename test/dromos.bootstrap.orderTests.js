module("DROMOS BOOTSTRAP ORDER MODULE");

test("ORDERED DEPENDENCY LOADING", function()
{
    // Turn on debug for tests
    console.error("----------MARKER------------");
    require.config({"debug" : true});

    QUnit.stop();
    require(["order!testModule/ordermodule1", "order!testModule/ordermodule2", "order!testModule/ordermodule3"], function(toModule1, toModule2, toModule3)
    {
	QUnit.equal(toModule1.value + toModule2.value + toModule3.value, 99);
	QUnit.start();
    });
});