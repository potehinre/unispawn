function showSubmenu(event) {
	var element = Event.element(event);
	var item = element.up('.item');
	var menu = item.down('.s-menu-section-submenu');
	
	var pos = item.viewportOffset()[0] - item.getOffsetParent().viewportOffset()[0];
	var width = menu.getWidth();
	
	if ( width + pos > 890 ) {
		var offset = 870 - width - pos;
		menu.setStyle( {left: offset.toString() + 'px'} );
	}
	
	item.addClassName('open');
}

function hideSubmenu(event) {
	var element = Event.element(event);
	element.up('.item').removeClassName('open');
}

// Top menu 
$$('.s-menu .s-menu-sections .item')
	.invoke('observe', 'mouseover', showSubmenu)
	.invoke('observe', 'mouseout', hideSubmenu);

// preload
var preload = [
	'/i/s-menu-corners.png'
]
for (var i = 0, l = preload.length; i < l; i++) {
	var img = new Image();
	img.src = preload[i];
}
