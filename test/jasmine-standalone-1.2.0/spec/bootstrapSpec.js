describe("dromos.Bootstrap", function(){

	var m_lLoadedModules;

	// All unit tests for the require functionality
	describe('require', function()
	{
		it ('loads itself as a module', function()
		{
			console.error(require("dromos.bootstrap"));
			expect(require("dromos.bootstrap")).not.toBe(null);
		});

		it ('loads dromos as a module', function()
		{
			expect(require("dromos")).not.toBe(null);
		});

		it ('loads dromos.utilities as a module', function()
		{
			expect(require("dromos.utilities")).not.toBe(null);
		});

		it ('loads jquery as a module', function()
		{
			expect(require("jquery")).not.toBe(null);
		});

		it ('reports a non existent module and continues to load', function()
		{
			expect(require("my/non/existent/module")).toBe(null);
		});

		waitsFor(function()
		{
			m_lLoadedModules = require("test/src/testModule") != null;
			return m_lLoadedModules;

		}, "testModule to load ", 1000);

		it ('loads a module and calls back with the specified module', function()
		{
			if (m_lLoadedModules)
			{
				require("test/src/testModule", function(toModule)
				{
					console.error(toModule);
					expect(require("test/src/testModule")).toBe(toModule);
				});
			}
			else
			{
				fail("Failed to load testModule");
			}
		});


	});

	// All unit tests for the define functionality
	describe('define', function()
	{

	});


});