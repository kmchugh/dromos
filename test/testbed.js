define(["jquery"], function($jq){
	
	return {
		init : function(toElement, toConfig, tnIndex)
		{
			$jq(toElement).css({
				"background-color": "red"
			});
		}
	};
});