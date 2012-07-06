/* constants */
/* ... */

/* ajax interface global indicators */
if (typeof Ajax != 'undefined'){
	var ajaxGlobalHandlers = {
		onCreate: function(request){
			//alert('Init Create');
			document.body.style.cursor = "wait";
		},
		onComplete: function(request, response){
			//alert('Init Complete');
			document.body.style.cursor = "default";
		},
		onException: function(t, e){
			//if (typeof DEBUG != 'undefined' && DEBUG){
				var error_info = $H(e);
				var s = '';
				error_info.each(function(pair){
					s += pair.key + ' = "' + pair.value + '"\n';
				});
				//alert(s);
			//}
		}
	};
	
	Ajax.Responders.register(ajaxGlobalHandlers);
}

