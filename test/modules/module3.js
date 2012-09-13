define(["testModule/module1", "testModule/module2"], function(toModule1, toModule2)
{
        return {
            "text": "my module 3",
            "value": toModule1.value + toModule2.value
        };
});