function get_user_background(url) {
	new Ajax.Request( '/ajax/user/background.html', {
		method: 'get',
		onComplete: function(req) {},
		parameters: { "url": url },
		onSuccess: function(req) {
			var obj = eval( "(" + req.responseText + ")" );
			if ( obj.style ) {
				var style = obj.style.split('|');
				
				applyBackground(style);
			} else if ( obj.body_class ) {
				applyBranding(obj);
			}
		}
	});
}

function applyBackground(style) {
	if ( style[0] == 1 ) {
		var url_link = 'url(' + style[1] + ')';
		document.body.setStyle({ background: url_link});
	} else if ( style[0] == 2 ) {
		var url_link = 'url(' + style[1] + ')';
		document.body.setStyle({ background: url_link});
		
		applyBackgroundRepeat(style[2]);
	} else if ( style[0] == 3 ) {
		document.body.setStyle({ background: style[1] });
	}
}

function applyBackgroundRepeat(value) {
	var styles = { 'backgroundSize' : null, 'backgroundRepeat' : 'no-repeat', 'backgroundPosition' : null };
	
	if ( value == 1 ) { // растянуть
		styles["backgroundSize"] = 'cover';
	} else if ( value == 2 ) { // замостить
		styles["backgroundRepeat"] = 'repeat';		
	} else if ( value == 3 ) { // по центру
		styles["backgroundPosition"] = 'center center';
	}
		
	document.body.setStyle( styles );
}

function applyBranding(obj) {
	document.body.addClassName('branding').addClassName(obj.body_class);
	if ( obj.href_link || obj.pixels ) {
		var random_number = Math.random()*100000000000000000;
		if ( obj.href_link ) {
			var replaced_string = obj.href_link.replace(/\[RANDOM\]/, random_number);
			var link = new Element('a', { 'class': 'promo-link', 'target': '_blank', 'href': replaced_string });
			document.body.insertBefore(link, document.body.firstChild);
		}
		
		if ( obj.pixels ) {
			for (var i=0; i<obj.pixels.length; i++) {
				var replaced_string = obj.pixels[i].replace(/\[RANDOM\]/, random_number);
				var img = new Element('img', { style: 'display: none;', src: replaced_string});
				document.body.insertBefore(img, document.body.firstChild);
			}
		}
	}

	$('topBanner').remove();
}