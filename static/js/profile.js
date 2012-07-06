function constructElement(name, attrs) {
	var el = document.createElement(name);
	
	if ( attrs != null ) {
		for (i=0; i<attrs.length; i++) {
			el.setAttribute(attrs[i][0], attrs[i][1]);
		}
	}
	
	return el;
}

function smartConstructElement(name, attrs, src) {
	var el, e;
	
	try {
		el = document.createElement(src);
	} catch (e) {
	    el = constructElement(name, attrs);
	}
	
	return el;
}

function addNewFavSite(id) {
	var tr = constructElement('tr');
	
	var input = constructElement('input', [['type', 'text'], ['name', 'fav_site_' + id], ['class','text contact-text'],['style','width:266px;']]);
	var td = constructElement('td');
	td.appendChild(input);
	tr.appendChild(td);
	
	var el = document.getElementById( 'fav_sites' );
	el.appendChild(tr);

	return false;
}


function addNewIM(id, ims) {
	var div = smartConstructElement('div', [['class', 'row3']], '<div class="row3">');
	
	var select = constructElement('select', [['name', 'im_type_' + id]]);
	div.appendChild(select);
	
	for (var i=0; i<ims.length; i++) {
		var option = constructElement('option');
		option.appendChild( document.createTextNode(ims[i]) );
		
		select.appendChild(option);
	}
	
	var input = constructElement('input', [['type', 'text'], ['name', 'im_' + id]]);
	div.appendChild(input);
	
	var p = smartConstructElement('p', [['class', 'del']], '<p class="del" />');
	div.appendChild(p);
	
	var div1 = smartConstructElement('div', [['class', 'checkbox_input']], '<div class="checkbox_input">');
	div.appendChild(div1);
	
	var input1 = constructElement('input', [['type', 'checkbox'], ['name', 'im_show_' + id], ['id', 'im_show_' + id]]);
	div1.appendChild(input1);
	
	var label = smartConstructElement('label', [['for', 'im_show_' + id]], '<label for="im_show_' + id + '" />');
	label.appendChild( document.createTextNode('показывать в профиле') );
	div1.appendChild(label);
	
	var br = smartConstructElement('br', [['class', 'clear']], '<br class="clear" />');
	div1.appendChild(br);
	
	var br1 = smartConstructElement('br', [['class', 'clear']], '<br class="clear" />');
	div.appendChild(br1);
	
	
	var el = document.getElementById( 'instant_messengers' );
	el.appendChild(div);

	return false;
}

function addNewIMinCabinet(id, ims) {
	var tr = constructElement('tr');

	var select = constructElement('select', [['class','contact-select'],['name', 'im_type_' + id]]);
	
	for (var i=0; i<ims.length; i++) {
		var option = constructElement('option');
		option.appendChild( document.createTextNode(ims[i]) );
		
		select.appendChild(option);
	}
	
	var td1 = constructElement('td');
	td1.appendChild(select);
	
	var input = constructElement('input', [['class','text contact-text'],['type', 'text'], ['name', 'im_' + id]]);
	
	var td2 = constructElement('td');
	td2.appendChild(input);


	var input1 = constructElement('input', [['type', 'checkbox'], ['name', 'im_show_' + id], ['id', 'im_show_' + id]]);
	
	var label = smartConstructElement('label', [['for', 'im_show_' + id],['class','checkBox']], '<label for="im_show_' + id + '" class="checkBox" />');
	label.appendChild(input1);
	label.appendChild( document.createTextNode('показывать в профиле') );
	
	var td3 = constructElement('td');
	td3.appendChild(label);
	
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
		
	var el = document.getElementById( 'instant_messengers' );
	el.appendChild(tr);

	return false;
}

function addNewTag(id, loved, sports) {
	var l = loved == 1 ? '' : 'u';

	var div = smartConstructElement('div', [['class', 'row3']], '<div class="row3">');
	
	var select = constructElement('select', [['name', l + 'tag_sport_' + id], ['id', l + 'tag_sport_id_' + id]]);
	div.appendChild(select);
	
	select.appendChild( constructElement('option') );
	
	for (var i=0; i<sports.length; i++) {
		var option = constructElement('option', [['value', sports[i][0]]]);
		option.appendChild( document.createTextNode(sports[i][1]) );
		
		select.appendChild(option);
	}
	
	var input = smartConstructElement('input', [['type', 'text'], ['name', l + 'tag_' + id], ['class', 'wickEnabled']], '<input type="text" name="' + l + 'tag_' + id + '" class="wickEnabled">');
	div.appendChild(input);
	
	myOnFocus = new Function ("e", "change_collection(document.getElementById('" + l + "tag_sport_id_" + id + "'))");
	input.onfocus = myOnFocus;
	
//	var br = smartConstructElement('br', [['class', 'clear']], '<br class="clear" />');
//	div.appendChild(br);
	
	var el = document.getElementById( l + 'loved_tags' );
	el.appendChild(div);

	return false;
}

function addInformerTag(id, sports) {
	var div = constructElement('div');
	
	var input = smartConstructElement('input', [['type', 'text'], ['name', 'sport_tag_' + id], ['class', 'wickEnabled']], '<input type="text" name="' + 'sport_tag_' + id + '" class="wickEnabled">');
	div.appendChild(input);
	
	myOnFocus = new Function ("e", "change_collection(document.getElementById('" + "tag_" + id + "'))");
	input.onfocus = myOnFocus;
	
	var select = constructElement('select', [['name', 'tag_' + id], ['id', 'tag_' + id]]);
	div.appendChild(select);
	
	select.appendChild( constructElement('option') );
	
	for (var i=0; i<sports.length; i++) {
		var option = constructElement('option', [['value', sports[i][0]]]);
		option.appendChild( document.createTextNode(sports[i][1]) );
		
		select.appendChild(option);
	}
	
	var br = smartConstructElement('br', [['class', 'clear']], '<br class="clear" />');
	div.appendChild(br);
	
	var el = document.getElementById( 'info1' );
	el.appendChild(div);

	return false;
}

var collection = [];
var sport = 0;

function change_collection(select_id) {
	var val = select_id.options[select_id.selectedIndex].value;
	if (val != sport) {
		sport = val;
		document.getElementById('tag_frame').src = '/ajax/profile/get_sport_tags.html?sport=' + val;
	}
}

function checkAll (form, filter) {
	for (var i =0; i < form.elements.length; i++) {
		var el = form.elements[i];
		
		if ( (el.type=='checkbox') && (!el.disabled) ) {
			if (filter == 'unreaded') {
				el.checked = el.parentNode.parentNode.className == 'unread' ? true : false;
			}
			else if (filter == 'readed') {
				el.checked = el.parentNode.parentNode.className == '' ? true : false;
			}
			else {
				el.checked = true;
			}
		}
	}
}
