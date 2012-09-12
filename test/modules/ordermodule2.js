define(function () {
	console.error("HERE IN MODULE 2");
	QUnit.start();
	var loModule = dromos.Bootstrap.getModule("testModule/ordermodule1");
	QUnit.ok(loModule !== null && loModule.isLoaded());

	loModule = dromos.Bootstrap.getModule("testModule/ordermodule2");
	QUnit.ok(loModule === null || !loModule.isLoaded());

	loModule = dromos.Bootstrap.getModule("testModule/ordermodule3");
	QUnit.ok(loModule === null || !loModule.isLoaded());

	QUnit.stop();
    return {
        text: "my order module 2",
        value: 33
    };
});