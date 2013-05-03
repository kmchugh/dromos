module("AJAX LINK MODULE", {
    setup : function(){
    },
    teardown : function(){
    }
});

// Don't run any tests until ajaxlink is actually loaded
require(['ajaxlink/dromos.ajaxlink'], function(toAjaxLink)
{
    test("ajax link loaded", function()
    {
        QUnit.ok(dromos.ajaxLink !== undefined);
    });

    test("links have been converted", function()
    {
        QUnit.equal(dromos.$jQ(".ajaxLink").length, 1);
    });

    test("Create Link using javascript", function(){});

});




