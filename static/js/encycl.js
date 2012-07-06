function show_enc_docs(sport_id, type, doc_id) {
	new Ajax.Updater(type, '/ajax/enc/docs.html', { 
		method: 'get',
		parameters: { type:type, sport_id:sport_id, doc_id:doc_id }, 
		onComplete: function() {$$('.list span.'+type+'-sa').invoke('observe', 'click', toggleEncyclMenu);} } );
}

function show_enc_tags(sport_id, type) {
	new Ajax.Updater(type, '/ajax/enc/tags.html', { 
		method: 'get',
		parameters: { type:type, sport_id:sport_id }, 
		onComplete: function() {$$('.list span.'+type+'-sa').invoke('observe', 'click', toggleEncyclMenu);} } );
}

function toggleEncyclMenu(event) {
	var element = Event.element(event);
	element.up('li').toggleClassName('open');
}

//Event.observe(window, 'load', function() {
//	$$('.list span').invoke('observe', 'click', toggleEncyclMenu);
//});
