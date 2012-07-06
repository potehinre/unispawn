/* cookies funcs */
var Cookies = {
	cookie_domain: '.sports.ru',
	set: function(cookieName, cookieContent, cookieExpireTime){
		var cookie_str = cookieName  + "=" +escape(cookieContent)
			             + "; path=/" ;
		if(Cookies.cookie_domain) {
			cookie_str = cookie_str + ";domain="+escape(Cookies.cookie_domain);
		}
		if (cookieExpireTime>0){
			var expDate=new Date();
			expDate.setTime(expDate.getTime()+cookieExpireTime*1000*60*60);
			var expires=expDate.toGMTString();
			cookie_str = cookie_str + "; expires=" + expires;
		}
		document.cookie = cookie_str;
	},
	get: function(cookieName){
		var ourCookie=document.cookie;
		if (!ourCookie || ourCookie=="")return "";
		ourCookie=ourCookie.split(";");
		var i=0;
		var Cookie;
		while (i<ourCookie.length){
			Cookie=ourCookie[i].split("=")[0];
			if (Cookie.charAt(0)==" ") Cookie=Cookie.substring(1);
			if (Cookie==cookieName) return unescape(ourCookie[i].split("=")[1]);
			i++;
		}
		return "";
	},
	erase: function(cookieName){
		var cookie = Cookies.get(cookieName) || true;
		Cookies.set(cookieName, '', -1);
		return cookie;
	},
	accept: function(){
		if (typeof navigator.cookieEnabled == 'boolean') return navigator.cookieEnabled;
		Cookies.set('_test', '1');
		return (Cookies.erase('_test') = '1');
	},
	set_domain: function(domain) {
		Cookies.cookie_domain = domain;
	}
}

/*
 * Randomly interchange elements
 * if param 'b' is set to 'true', it will shuffle sub- and multisubarrays
 * in their own right, the default value is 'false'
 */
Array.prototype.shuffle = function(b){
	var i = this.length, j, t;
	while(i){
		j = Math.floor((i--) * Math.random());
		t = b && typeof this[i].shuffle !== 'undefined' ? this[i].shuffle() : this[i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
};

/*
 * trim funcs
 */
Object.extend(String.prototype, {
	LTrim: function(){
		return this.replace(/\s*((\S+\s*)*)/, "$1");
	},
	RTrim: function(){
		return this.replace(/((\s*\S+)*)\s*/, "$1");
	},
	trim: function(){
		return this.LTrim(this.RTrim());
	}
});

/*
 * we need win1251, not that utf stuff
 */
/*
window.encodeURIComponent = function(str){
	var trans = [];
	for (var i = 0x410; i <= 0x44F; i++) trans[i] = i - 0x350; // А-Яа-я
	trans[0x401] = 0xA8; // Ё
	trans[0x451] = 0xB8; // ё
	var ret = [];
	for (var i = 0; i < str.length; i++){
		var n = str.charCodeAt(i);
		if (typeof trans[n] != 'undefined') n = trans[n];
		if (n <= 0xFF) ret.push(n);
	}
	return escape(String.fromCharCode.apply(null, ret)).replace(/\+/g, '%2B'); // +
}
window.decodeURIComponent = function(str){
	return unescape(str);
}
*/

function openExportToBlog (doc_id, cls) {
	var id = Math.floor(Math.random() * 1000 + 1); // random ID for IE 6-
	var win = window.open('/informer/doc_to_blog.html?doc_id=' + doc_id + '&doc_class=' + cls, 'win'+ id, 'top=50, left=200, width=640, height=400, toolbar=no, location=no, directories=no, status=yes, menubar=no, scrollbars=no, resizable=no');

	return false;
}

function toggleRSSPartnersBlock (el) {
	$(el).toggleClassName('open');

	$('prss_news').toggle();
	$('prss_settings').toggle();
}

function toggleAuthInputs(el){
	if (el == 'openid') {
		$('openid_auth').removeClassName('hidden');
		$('normal_auth').addClassName('hidden');
	} else {
		$('normal_auth').removeClassName('hidden');
		$('openid_auth').addClassName('hidden');
	}
} 

function niveaGadgetsInit(id){	
	new Ajax.Updater({ 'success':'niveaGadgetsDiv' },
		'/ajax/advert/nivea3in1.html', {
			method: 'get',
			parameters: { city_id: id } 
		}
	);
}

function garnierWidgetInit(){
	new Ajax.Updater({ 'success':'garnierWidgetsDiv' },
			'/extremesport/export.html', {
			method: 'get'
		}
	);
}

function showHiddenObjects(mode, type, elem) {
	var seenElem 	= ( mode == 1 ? '' : 'un' ) + type + 'More' + elem;
	var hiddenElem	= ( mode == 1 ? '' : 'un' ) + type + 'Hidden' + elem;

	$(seenElem).removeClassName('hidden');
	$(hiddenElem).hide();

	return false;
}

function makeBackground(key, color){
	color = color && /^[#0-9a-z]{4,7}$/i.test(color) ? color : 'black';
	key = key || new Date().getTime();
	var wh = window.innerHeight,
		bh = document.body.clientHeight,
		height = wh > bh ? wh : bh;
	$$('.darker-div').each(Element.remove)
	var darker = new Element('div',{'class': 'darker-div'}).writeAttribute({'time':key+''}).setStyle({
		'height': height+'px',
		'width': document.body.clientWidth+'px',
		'backgroundColor': color
	});
	$$('body').invoke('insert', darker);

	return false;
}

function makePopUp(options, callback){
	/* Make pop-up
		options.key - key to found darker for this window
		options.classes - window css classes
		options.width - darker height
		options.height - darker height
		options.title - window title
		options.html - inner html
		options.hasFon - true call makeFon
		options.fonColor - color for makeFon
		options.buttonFile - button Find name
		options.buttonSubmit - button Submit name
		options.buttonCancel - button Cancel name
		options.mode - type of window action
	*/
	$$('.pop-up-wrapper').each(Element.remove)
	var o = options ? options : {},
		css_classes = o.classes || '',
		hasFon = o.hasFone || true,
		fonColor = o.fonColor || 'black',
		height = o.height || 'auto',
		width = o.width || 300,
		key = o.key || new Date().getTime(),
		title = o.title || 'Сообщение';
		if (height != 'auto')
		{
			height = height+'px';
		}
		var wrapperDiv = new Element('div',{'class':css_classes+' pop-up-wrapper'})
                    .writeAttribute({'time':key+''})
                    .setStyle({ 'height':height, 'width':width+'px' });
		var headDiv = new Element('div',{'class': 'pop-up-head'}).update(title),
		removeFunc = function(){
			$$('.darker-div[time="'+key+'"], .pop-up-wrapper[time="'+key+'"]').each(Element.remove);
			return false;
		};
	wrapperDiv.appendChild(headDiv);
	wrapperDiv.appendChild(new Element('div',{'class': 'pop-up-body'}).update(o.html));
	

	var footDiv = new Element('div', {'class': 'pop-up-foot'});
	var formElem;

	if (o.mode == 'setPhoto' ) {
		if (o.buttonFile){
			formElem = new Element('form', {'action': '/profile/edit_photo.html', 'method': 'post', 'enctype': 'multipart/form-data', 'name': 'edit_photo'}); // '/profile/edit.html?tab=form'
			formElem.appendChild(new Element('input', {type: 'file', name: 'photo'}).observe('click', callback));
		}
	}
	if (o.mode == 'deletePhoto' ) {
		formElem = new Element('form', {'action': '/profile/edit_photo.html', 'method': 'post', 'enctype': 'multipart/form-data', 'name': 'delete_photo'}); // /profile/edit.html?tab=form
		formElem.appendChild(new Element('input', {name: 'del_photo', type: 'hidden', value: '1'}));
	}
	footDiv.appendChild(formElem);

	var innerDiv = new Element('div', {});
	formElem.appendChild(innerDiv);
	innerDiv.appendChild(new Element('input', {value: o.buttonSubmit, type: 'submit'}).observe('click', callback));
	innerDiv.appendChild(new Element('input', {value: o.buttonCancel, type: 'button'}).observe('click', removeFunc));
	wrapperDiv.appendChild(footDiv);

	wrapperDiv.setStyle({'marginLeft': '-'+width/2+'px'});
	if (height != 'auto') 
	{
		document.body.appendChild(wrapperDiv.setStyle({'marginTop': '-'+height/2+'px'}));
	} 
	else 
	{
		document.body.appendChild(wrapperDiv.addClassName('popUpLayoutHeightFixing'));
		var inDOM = $$('.popUpLayoutHeightFixing')[0],
			topMargin = inDOM.clientHeight/2;
		inDOM.setStyle({'marginTop':'-'+topMargin+'px'}).removeClassName('popUpLayoutHeightFixing');
	}
	if (hasFon) makeBackground(key,fonColor);
}

function setPhoto(key, color) {
	var popUpHtml = new Element('div',{'class':'add-photo-html'}), select, opt_val, opt_len, opt_text;
	popUpHtml.appendChild(new Element('p', {'class':'local-error', 'style': 'text-align:center;'}).update('Это должен быть файл формата GIF, JPEG или PNG размером не больше 200 Кб.<br />Сама картинка должна иметь разрешение, не более 200 пикселей в ширину и 500 в высоту.<br />Изображения большего разрешения будут уменьшены.'));

	makePopUp({
				'key': key,
				'classes': 'add-photo-pop-up',
				'width': 300,
				'title': 'Загрузить фотографию',
				'html': popUpHtml,
				'hasFon': false,
				'buttonFile': 'Загрузить',
				'buttonSubmit': 'Загрузить',
				'buttonCancel': 'Отмена',
				'mode': 'setPhoto'
			},function(){} );

	return false;
}

function deletePhoto(key, color) {
	var popUpHtml = new Element('div',{'class':'add-photo-html'}), select, opt_val, opt_len, opt_text;

	makePopUp({
				'key': key,
				'classes': 'add-photo-pop-up',
				'width': 250,
				'title': 'Удалить фотографию',
				'html': popUpHtml,
				'hasFon': false,
//				'buttonFile': 'Загрузить',
				'buttonSubmit': 'Удалить',
				'buttonCancel': 'Отмена',
				'mode': 'deletePhoto'
			},function(){} );

	return false;
}



function getFantasyTeams(page, numpage){
	new Ajax.Request( '/fantasy/user/teams.json', { 
        method: 'get', 
        parameters: {user_id: userId, mode: 1},
        onComplete: function(req) {}, 
        onSuccess: function(req) {
            var obj = eval( "(" + req.responseText + ")" );

            $('loadingSpan').hide();
            if ( obj.fantasy.count || obj.predictor.count || obj.betgame.account_id ) {
                $('emptyFantasySpan').hide();
                if ( page == 'main' ) {												
                    $('fantasyTeamsCountHref').innerHTML = 'все ' 
                        + ( obj.fantasy.count + obj.predictor.count 
                        + ( obj.betgame.account_id ? 1 : 0 ) ) 
                        + '<img class="arrow" src="/i/all-arrow-blue.gif" alt="все">';
                        addGamesTab(page);
                }											
                showFantasyTeams(obj, page, numpage);
            } 
            else {                         
                $('emptyFantasySpan').show();
            }
        },
        onFailure: function() { 
            $('loadingSpan').hide();
            $('emptyFantasySpan').show();
        } 
    } );
}

function addGamesTab(page) {
 	var ulElem = $('tabs'); 
	var childs = ulElem.getElementsByTagName('LI');

	var liElem = new Element('li');
	var aElem = new Element('a', {'title':'игры', 'href': userURL + '?show=games'});

	if ( page == 'main' ) {
		aElem.update('игры');
	} else if ( page == 'games' ) {
		var spanElem = new Element('span').update('игры');
		aElem.appendChild(spanElem);
	}

	liElem.appendChild(aElem);
	liElem.innerHTML = liElem.innerHTML + ' |';	
	
	ulElem.insertBefore(liElem, childs[1]);
}

function showFantasyTeams(obj, page, numpage) {
	$('currTeamsTableDiv').addClassName('f-fix');
    
	var fantasy 	= obj.fantasy;
	var predictor 	= obj.predictor;
	var betgame 	= obj.betgame;

	var teams = obj.teams || obj;

	var teamsAdded 		= 0;
	var fantasyAdded 	= 0;
	var predictorsAdded = 0;
	var exTeamsAdded	= 0;
	if ( betgame.account_id ) {
		addOneGame(betgame, 'betgame');
		teamsAdded++;
		betgame.atpage = 1;
	}

	var maxGamesAtPage 		= page == 'main' ? 10 : 200;
	var minFantasyAtPage 	= page == 'main' ? 5 : 100;
	var minPredictorsAtPage = page == 'main' ? 4+(teamsAdded == 1 ? 0 : 1) : 99;

	var realPredictorsAtPage 	= minPredictorsAtPage < predictor.count ? minPredictorsAtPage : predictor.count;
	var realFantasyAtPage 		= ( minFantasyAtPage < fantasy.count ? minFantasyAtPage : fantasy.count ) + ( realPredictorsAtPage < minPredictorsAtPage ? minPredictorsAtPage-realPredictorsAtPage : 0 );
	realPredictorsAtPage		+= realFantasyAtPage < minFantasyAtPage ? minFantasyAtPage-realFantasyAtPage : 0;

	var i=0;        
	while ( fantasyAdded < realFantasyAtPage && fantasy.teams[i] ) {
		if ( fantasy.teams[i].status == 1 ) {
			addOneGame(fantasy.teams[i], 'fantasy', teamsAdded);
			teamsAdded++;
			fantasyAdded++;
			fantasy.teams[i].atpage = 1;
		}
		i++;
	}

	i=0;
	while ( predictorsAdded < realPredictorsAtPage && predictor.teams[i] ) {
		if ( predictor.teams[i].status == 1 ) {
			addOneGame(predictor.teams[i], 'predictor', teamsAdded);
 			teamsAdded++;
			predictorsAdded++;			
			predictor.teams[i].atpage = 1;
		}
		i++;
	}

	if ( page == 'games' && teamsAdded < maxGamesAtPage ) {
		for ( i=0; i<fantasy.count; i++ ) {
			if ( fantasy.teams[i].status == 0 ) {
				addOneGame(fantasy.teams[i], 'fantasy', exTeamsAdded, 1);
				exTeamsAdded++;
				fantasy.teams[i].atpage = 1;
			}
		}

		for ( i=0; i<predictor.count; i++ ) {
		 	if ( predictor.teams[i].status == 0 ) {
				addOneGame(predictor.teams[i], 'predictor', exTeamsAdded, 1);
				exTeamsAdded++;
				predictor.teams[i].atpage = 1;
			}
		}

		$('finishedDiv').show();
		$('exTeamsDiv').show();
	}
}

function addOneGame(team, type, teamsAdded, archive) {
	var div = document.createElement('div');		
	div.addClassName('p-game').addClassName('f-left');
	if ( teamsAdded % 2 == 1 ) {
		div.addClassName('nmr');
	}

	var divHead = document.createElement('div');
	divHead.addClassName('pg-head');
	if ( type == 'fantasy' ) {
		divHead.innerHTML = '<a href="/fantasy/">fantasy</a> | <a href="/fantasy/' + team.sport_webname + '/">' + team.sport + '</a>';
	} else if ( type == 'predictor' ) {
		divHead.innerHTML = '<a href="/predictor/">прогнозы</a> | <a href="/predictor/' + team.sport_webname +'/">' + team.sport + '</a>';
	} else if ( type == 'betgame' ) {
		divHead.innerHTML = '<a href="/betgame/">букмекер</a>';
	}
	div.appendChild(divHead);

	var divBody = document.createElement('div');
	divBody.addClassName('pg-body');
	div.appendChild(divBody);		

	var pBodyImage = document.createElement('p');
	pBodyImage.addClassName('img').addClassName('f-left');
	if ( type == 'fantasy' || type == 'predictor' ) {
		pBodyImage.appendChild(new Element('img', {'alt': team.sport + ' ' + team.fantasy_short_name, 'src': 'http://www.sports.ru/images/' + team.avatar}));
	} else if ( type == 'betgame' ) { 
		pBodyImage.appendChild(new Element('img', {'alt': 'предиктор', 'src': 'http://www.sports.ru/storage/0000/4/6/46604832/1287067254.204736_11.jpg'}));
	}
	divBody.appendChild(pBodyImage);
		
	var pBodyInfo = document.createElement('p');
	pBodyInfo.addClassName('pg-info');

	if ( type == 'fantasy' ) {
	   	pBodyInfo.innerHTML += '<span class="gray-text">турнир:</span> <a href="/fantasy/' + team.sport_webname + '/' + team.tournament_webname + '/">' + team.fantasy_short_name + '</a><br />';
		if ( archive ) { 
			pBodyInfo.innerHTML += '<span class="gray-text">команда:</span> ' + team.team_name  + '<br />';
		} else {
			pBodyInfo.innerHTML += '<span class="gray-text">команда:</span> <a href="/' + team.url + '">' + team.team_name + '</a><br />';
		}
		pBodyInfo.innerHTML += '<span class="gray-text">место в турнире:</span> ' + team.place + ' <span class="gray-text">|</span> <span class="gray-text">очки:</span> ' + team.points + '<br />';

		if ( team.deadline ) {
			pBodyInfo.innerHTML += '<span class="gray-text">дедлайн:</span> ' + team.deadline;
		}
	} else if ( type == 'predictor' ) {		
		pBodyInfo.innerHTML += '<a href="/' + team.url + '">Профиль</a><br />';
		pBodyInfo.innerHTML += '<span class="gray-text">турнир:</span> <a href="/predictor/' + team.sport_webname + '/' + team.tournament_webname + '/">' + team.fantasy_short_name + '</a><br />';

		if ( team.deadline ) {
			pBodyInfo.innerHTML += '<span class="gray-text">следующий матч:</span> ' + team.deadline + '<br />';
		}
	} else if ( type == 'betgame' ) {
		pBodyInfo.innerHTML += '<a href="/' + team.url + '">Профиль</a><br />';
		pBodyInfo.innerHTML += '<span class="gray-text">баланс:</span> ' + team.sum + ' <span class="gray-text">|</span> <span class="gray-text">ROI:</span> ' + team.roi + '<br />';
		pBodyInfo.innerHTML += '<span class="gray-text">место:</span> ' + team.place + '<br />';
	}

	divBody.appendChild(pBodyInfo);

	if ( archive ) {
		$('exTeamsDiv').appendChild(div);
	} else {
		$('currTeamsTableDiv').appendChild(div);
	}
}

function addFriend(user, num) {
	var mainDiv = $('onlineFriends');
	var div = new Element('div', {'class': 'f-left p-friend' + ( num % 2 == 1 ? ' nmr' : '')});
	var imgP = new Element('p', {'class': 'img f-left'});
	div.appendChild(imgP);

	var imgA = new Element('a', {'title': user.name, 'href': user.url});
	imgA.appendChild(new Element('img', {'alt': user.name, 'src': 'http://www.sports.ru'+user.avatar.url, 'height': user.avatar.height, 'width': user.avatar.width}));
	imgP.appendChild(imgA);

	div.appendChild(new Element('a', {'title': user.name, 'href': user.url}));

	var infoP = new Element('p', {'class': 'friend-info'});
	for (i=0; i<user.stars; i++) {
		var starA = new Element('a', {'title': user.name, 'href': user.url});
		starA.appendChild(new Element('img', { 'src': '/i/user-star.gif', 'alt': 'звезда'}));
		starA.insert(' ');
		starA.appendChild(new Element('b'));
		infoP.appendChild(starA);
	}
	infoP.appendChild(new Element('b')).appendChild(new Element('a', { 'href': user.url })).update(user.name);

	user.level = user.premium ? 5 : user.level;
	for (var i=0; i<user.level; i++) {
		infoP.insert(' ');
		infoP.appendChild(new Element('img', { 'src': '/i/b-dot.png', 'alt': '' }));
	}
	for (var i=user.level; i<5; i++) {
		infoP.insert(' ');
		infoP.appendChild(new Element('img', { 'src': '/i/g-dot.png', 'alt': '' }));
	}
	
	infoP.appendChild(new Element('br'));
	infoP.appendChild(new Element('span', { 'class': 'gray-text'})).update('Зарегистрирован' + user.ending + ':');
	infoP.insert(' ' + user.date);
	infoP.appendChild(new Element('br'));
	if ( user.geo.country ) {
		infoP.appendChild(new Element('a', { 'href': '/geo/country/' + user.geo.country.id + '.html', 'class': 'geo' })).update(user.geo.country.name);
	}
	if ( user.geo.region ) {
		infoP.insert(', ');
		infoP.appendChild(new Element('a', { 'href': '/geo/region/' + user.geo.region.id + '.html', 'class': 'geo' })).update(user.geo.region.name);
	}
	if ( user.geo.city ) {
		infoP.insert(', ');
		infoP.appendChild(new Element('a', { 'href': '/geo/city/' + user.geo.city.id + '.html', 'class': 'geo' })).update(user.geo.city.name);
	}
	div.appendChild(infoP);

	div.appendChild(new Element('i', {'class': 'rb-star'}));
	div.appendChild(new Element('i', {'class': 'lb-star'}));
	div.appendChild(new Element('i', {'class': 'lt-star'}));
	div.appendChild(new Element('i', {'class': 'rt-star'}));
	mainDiv.appendChild(div);
}

function showOnlineFriends(mode) {
	if ( mode == 1 ) {
		$('allFriends').hide();
		$('onlineFriends').show();
		new Ajax.Request( '/ajax/user/online_friends.html',
						{ 	method: 'get', 
							parameters: {user_id: userId},
							onComplete: function(req) {}, 
							onSuccess: function(req) {
											var obj = eval( "(" + req.responseText + ")" );
											var users = obj.data;
											var count = obj.count;
											if ( count ) {
												for (var i=0; i<count; i++) {
													addFriend(users[i], i);
												}
											}
										},
							onFailure: function() {} } 
							);
	} else {
		$('allFriends').show();
		$('onlineFriends').update('');
	}
}

function maaloxFoodWidgetInit(id){
	new Ajax.Updater({ 'success':'maaloxFoodWidgetDiv' },
			'/ajax/advert/maalox_food.html', {
			method: 'get',
			parameters: { recipe_id: id } 
	});
}

function brief_counter(){
	document.observe("dom:loaded", function() {
		var counter = $('brief_counter').innerHTML;
		var point = counter - $('brief').getValue().length;

		$('brief_counter').innerHTML = ( point );
		brief_color(point);


		$('brief').observe('keyup', function(event) { 
			var point = counter - $('brief').getValue().length;
			$('brief_counter').innerHTML = point;
			brief_color(point);
        });

        $('brief').observe('change', function(event) { 
        	var point = counter - $('brief').getValue().length;
			$('brief_counter').innerHTML = point;
			brief_color(point);
        });
    });
}

function brief_color( point ) {
	var style = { color: "#000000" };
	
	if ( point < 0 ) {
		style = { color: "#CC0000" };
	} 

	$('brief_counter').setStyle(style);
}


function fireEvent(element, event) {
	if (document.createEvent) {
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		return !element.dispatchEvent(evt);
	} else {
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt)
	}
}

var scrollPhotos = 0;

document.observe("dom:loaded", function() {
	$$('.c-l-control a').invoke('observe','click',function(){
		$$('.c-inner-inner')[0].insertBefore($$('.c-item:last-child')[0],$$('.c-item')[0]);
		
	});
	$$('.c-r-control a').invoke('observe','click',function(){
		$$('.c-inner-inner')[0].appendChild($$('.c-item')[0])
	});
	if ( scrollPhotos ) { 
		for ( var i=0; i<scrollPhotos; i++ ) {
			fireEvent($('scrollRight'), "click");
		}
	}

    //if (ODKL) { ODKL.init(); } //odnoklassniki's counter init
});

function checkInputLength(elem, max, spanInner) {
	if ( elem.value.length <= max ){		
		$(spanInner).innerHTML = max - elem.value.length;
	} 
    else {
		$(spanInner).innerHTML = max - elem.value.length;
/*
		$(spanInner).innerHTML = 0;
		elem.value = elem.value.substring(0, max-1);
*/
    }
}

function refreshInputLength(input, counter, max) {
	var lng = $F(input).length;
	$(counter).innerHTML = max ? max - lng : lng;
}

function setDefaultValueToInput(elem, text, counter, max) {
	if ( elem.value == '' ) { elem.value = text; }
	if ( counter ) { refreshInputLength(elem.id, counter, max); }
}

function clearValueOfInput(elem, text, counter, max) {
	if ( elem.value == text ) { elem.value = ''; }
	if ( counter ) { refreshInputLength(elem.id, counter, max); }
}

function getWordForPlural(number, one, two, five) {
    number = Math.abs(number);
    number %= 100;

    if ( number > 19 ) { number %= 10; }
    if ( number == 0 || number > 4 ) { return five; }
    else if ( number == 1 ) { return one; }
    else { return two; }
}

function InOutFavorite( elem, doc_id, doc_class, dtime, hide_block_id ){
	
	var url 	= '/ajax/user/add_favorite.html';
	var tag_id 	= elem.getAttribute('id');

	if ( tag_id == 'delFavorite' ) {
		if ( !confirm('Вы уверены, что хотите убрать из избранного?') ) {
			return;
		} 
        if ( hide_block_id ) { 
            $('favorite_' + hide_block_id ).hide();
        }
	}

	new Ajax.Request( url, 
        {   method: 'get',
			parameters: {"doc_id": doc_id, "doc_class": doc_class, "dtime": dtime, "url_back": location.pathname + location.search },
			onComplete: function(transport) {
				var json = transport.responseText.evalJSON();
				if ( json ) {

					var star = elem.firstDescendant();
					
					if ( star ) {
						if ( json.tag_id == 'addFavorite' ) {
							star.alt = 'в избранное';
							star.src = '/i/ico/ico-fav-star-empty.png';
						}
						if ( json.tag_id == 'delFavorite' ) {
							star.alt = 'убрать из избранного';
							star.src = '/i/ico/ico-fav-star-fill.png';
						}
					}
					elem.setAttribute("id", json.tag_id);
				}
			}, 
			onSuccess: function(transport) {
				var json = transport.responseText.evalJSON();
				if ( json.redirect ) {
					window.location = json.redirect;			
				}
			},
			onFailure: function(transport) {
				alert('Произошла ошибка, обратитесь в службу поддержки.');
			}
			
		} 
	);
}

var chooseSubSectionText = 'выберите подраздел';
var maxSubsections = 3;

function setSubSections(elem, highlight){
	var chosen_id = elem.value;
	var topSelect = $('subSectionsSel0');
	topSelect.disable();

	new Ajax.Updater({ 'success':'subSectionsSel0' },
						'/ajax/sections/subsections.html', {
						method: 'get',
						parameters: { sect_id: chosen_id, choose_option: 1 },
						onComplete: function() {	
								if ( topSelect.options.length ) {
									topSelect.enable();
									$('addSubSection').show();
								} else {
									topSelect.disable();
									$('addSubSection').hide();
								}

								$('newSubSelects').update('');
								if ( highlight ) {
									topSelect.selectedIndex = 0;
									selectSubSections(chosen_id);									
								}
							}
						} );
	return false;
}

function selectSubSections(chosen_id) {
	if ( post_sport_id == chosen_id ) {
		var count = 0;
		for ( var key in sections ) {
			count++;
		}

		var i = 1;
		for ( var key in sections ) {
			if ( i != maxSubsections ) {
				addSubSectionSelect(key);
			} else {
				selectOption($('subSectionsSel0'), key);
				break;
			}            

			i++;
		}
	}
}

function addSubSectionSelect(selectedValue) {
	var elem = $('newSubSelects');

	var num = $('newSubSelects').childNodes.length+1;
	var sel = new Element('select', {name: 'subsports', id: 'subSectionsSel'+num});

	var topSel = $('subSectionsSel0');

	sel.insert(topSel.innerHTML);
	if ( selectedValue ) {	
		selectOption(sel, selectedValue);
	} else { 
		sel.selectedIndex = 0;
	}
	elem.appendChild(sel);

	if ( num+1 == maxSubsections ) {
		$('addSubSection').hide();
	}

	return false;
}

function selectOption(sel, value) {
	for (var i=0; i<sel.options.length; i++ ){
		if ( sel.options[i].value == value ) {
			sel.selectedIndex = i;
		}
	}
}

function addTagLink(elem, id) {
	elem.hide();
	$('tag_' + id).show();
	var link = $('addLink_' + id);
	if ( id < 5 && link) {
		link.show();
	}
}

function selectPostPhoto(elem, block_pics, pic_id, class_name, field_id ) {
	
	var current_id = $(field_id).value;
	
	$(field_id).setAttribute("value", pic_id );

	if (current_id) {
		var current_photo = $('img_' + current_id);
		if ( current_photo ) {
			current_photo.removeClassName(class_name)
		}
	}
	
	$('img_' + pic_id).addClassName(class_name);

}

function selectPostMedia() {
	$('archive_photos').toggle();
	$('brief_media').toggle();
	var PostMediaType = $('media_type');
	var type = PostMediaType.getAttribute('value');
	if ( type == 'archive_photos') {
		PostMediaType.setAttribute('value', 'brief_media'	);
	} else {
		PostMediaType.setAttribute('value', 'archive_photos');
	}
	
}

function getPostPhotos( id, image_id, sport_id, tags, page ){
	
	new Ajax.Updater({ 'success':id },
						'/ajax/photos/search.html', {
						method: 'get',
						parameters: { "image_id": image_id, "tags": tags, "sport_id": sport_id, "page": page },
						onComplete: function() {	
							
							var block = $('paginator_photos');
							if ( block ) {
								var links = block.getElementsByTagName('a');
				
								for (var i=0; i<links.length; i++ ){	
									links[i].observe('click', function ( event ) {
										var elem = Event.element(event);
										getPostPhotos( 
											id, image_id, sport_id, tags, 
											elem.getAttribute('href').replace(/^.*?(\d+)$/, "$1")
										);
									});
								}
							}
						}
						} );
	return false;
}

function getElementContent(elem) {
	var str;
	if (window.XMLSerializer) {
		var serializer = new XMLSerializer ();
		str = serializer.serializeToString(elem);
	} else {
		str = elem.outerHTML;
	}

	return str;
}


function set_observer_by_id(elem_id, action, cb) {
    document.observe("dom:loaded", function() {
        set_bare_observer_by_id(elem_id, action, cb);
    });
}

function set_bare_observer_by_id(elem_id, action, cb) {
    if ( $(elem_id) == null ) return;

    $( elem_id ).observe(action, function(event) { 
        //console.log( "ACTION: %s", action);
        cb.apply(null, [event]);
    });
}

function set_mass_observer_by_id(elem_id, actions, cb) {
    //console.log("data : %s", Object.toJSON( actions ) );
    actions.uniq().each( function(act) {
        //console.log( "set observer '%s' to '%s'", elem_id, act);
        set_observer_by_id(elem_id, act, cb);
    });
}

function set_mass_bare_observer_by_id(elem_id, actions, cb) {
    //console.log("data : %s", Object.toJSON( actions ) );
    actions.uniq().each( function(act) {
        set_bare_observer_by_id(elem_id, act, cb);
    });
}

// check for block view state
function block_by_cookie_check (cookie_name) {
    Cookies.set_domain('');
    var c = Cookies.get( cookie_name );
    return c;
}

// show block by cookie
function block_by_cookie_show (cookie_name, block_id) {
    if ( ! block_by_cookie_check(cookie_name) ) {
        $( block_id ).show();
    }
    else {
        $( block_id ).hide();
    }
}

// set cookie for block hiding
function block_by_cookie_set(cookie_name, value, expire) {
    if ( expire == null ) {
        expire = 24 * 365; // year
    }
    if ( value == null ) {
        value = 1; 
    }
    Cookies.set_domain('');
    Cookies.set(cookie_name, value, expire);
}

/**
* Returns the value of the selected radio button in the radio group, null if
* none are selected, and false if the button group doesn't exist
*
* @param {radio Object} or {radio id} el
* OR
* @param {form Object} or {form id} el
* @param {radio group name} radioGroup
*/
function $RF(el, radioGroup) {
    if($(el).type && $(el).type == 'radio') {
        var radioGroup = $(el).name;
        var el = $(el).form;
    } else if ($(el).tagName.toLowerCase() != 'form') {
        return false;
    }
 
    var checked = $(el).getInputs('radio', radioGroup).find(
        function(re) {return re.checked;}
    );
    return (checked) ? $F(checked) : null;
}

function selectRadionButton(form, radioGroup, value) {
    var inputs = $(form).getInputs('radio', radioGroup);
	for (var i=0; i<inputs.length; i++) {
		if ( inputs[i].value == value ) {
			inputs[i].checked = true;
			break;
		}
	}
}

function loadXMLString(text){
	if ( window.DOMParser ) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(text,"text/xml");
	} else { // Internet Explorer
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(text); 
	}
	return xmlDoc;
}