function showPopup (idpopup) {
		
	var overlay = document.getElementById('overlay');
	var block = document.getElementById(idpopup);
	var html = document.documentElement;
	var scrollPos = (html.scrollTop || document.body.scrollTop);
	var heightWindow = html.clientHeight; /* || document.body.clientHeight */
	if (block.style.display == 'none'){
		overlay.style.display = '';
		block.style.display = '';
		var heightBlock = block.offsetHeight;
		var posTop = scrollPos + (heightWindow/2 - heightBlock/2);
		postTop = posTop < 100 ? 100 : posTop;
		block.style.top = posTop + 'px';
	} else {
		overlay.style.display = 'none';
		block.style.display = 'none';
	}
}
	
function closePopupBlock (idpopup) {
	var overlay = document.getElementById('overlay');
	var block = document.getElementById(idpopup);
	overlay.style.display = 'none';
	block.style.display = 'none';
}
	
function showHiddenBlock (idblock) {
	var block = document.getElementById(idblock);
	if (block.style.display == 'none'){
		block.style.display = '';
	} else {
		block.style.display = 'none';
	}
}

function onFocusInputField (elem, defaultText) {
	if (elem.value == defaultText) { 
		elem.value = ''; 
	}
}

function onBlurInputField (elem, defaultText) {
	if (elem.value == '') { 
		elem.value = defaultText; 
	}
}

function authorizeUser (isOpenId, postfix) {
	var params = new Object();

	if (!postfix) {
		postfix = '';
	} else {
		params["social"]		= SportsOAuth2.social;
	}

	params["login"]				= $('autorizationLogin' + postfix).value;
	params["password"] 			= $('autorizationPasswd' + postfix).value;	
	params["control_charset"] 	= $('autorizationControl').value;
	params["back_url"]			= $('autorizationBackURL').value;
	params["remember_me"] 		= $('remember_me').checked ? 1 : 0;
	params["open_id"] 			= isOpenId ? $('autorizationOpenId').value : '';

	$('authorizationError'+ postfix).hide().update('');

	if ( !params["open_id"] ) {
		if ( !params["login"] || !params["password"] ) {
			return false;
		}
	}

	new Ajax.Request( '/ajax/user/authorization.html', {
        'method': 'post',
        'parameters': params,
        'onSuccess': function(req) {
			var obj = eval( "(" + req.responseText + ")" );
			if ( obj.result ) {
				if ( postfix ) {
					socialFriends();
                    closePopupBlock('autoriz-popup');
				} else {
					reloadBrowserWindow();
				}
			}
			else if ( obj.result == 0 && obj.code == 'VKUserExist' ) {
				closePopupBlock('autoriz-popup');
				showPopup('err-account-link-popup');
			}
			else {
				$('authorizationError'+ postfix).show().update(obj.error);
			}
		}
	} );

	return false;
}

function registerUser( ) {
	var params = new Object();
	params["login"] 			= $('registrationLogin').value;
	params["nick"] 				= $('registrationNick').value;
	params["control_charset"] 	= $('registrationControl').value;
	params["url"]				= $('registrationBackURL').value
	params["passwd"]			= $('registrationPasswd').value;
	params["repasswd"]			= $('registrationRepasswd').value;	
	params["country_id"]		= $('registration_country_select').value;
	params["region_id"]			= $('registration_region_select').value;
	params["city_id"]			= $('registration_city_select').value;
	params["age"]				= $('registrationAge').value;
	params["sex"]				= $F('registrationSex');

	$('registrationError').hide().update('');

	new Ajax.Request( '/ajax/user/registration.html', {
		'method': 'post',
		'parameters': params,
		'onSuccess': function(req) {
			var obj = eval( "(" + req.responseText + ")" );
			
			if ( obj.result ) {
				alert('Ваш аккаунт зарегистрирован.\nНа указанный Вами почтовый ящик скоро придет письмо с подтверждением регистрации.');
				reloadBrowserWindow();
			} else if ( obj.error ) {
				$('registrationError').show().update(obj.error);
				$('adv-data').show();
			}
		}
	});
}

function registerSocialUser() {
	var params = new Object();

	params["login"] 			= $('registrationSocialLogin').value;
	params["nick"] 				= $('registrationSocialNickname').value;
	params["control_charset"] 	= $('registrationSocialControl').value;
	params["url"]				= $('registrationSocialBackURL').value
	params["social"]			= SportsOAuth2.social;
	
	$('registrationError').hide().update('');

	new Ajax.Request( '/ajax/user/registration.html', {
		'method': 'post',
		'parameters': params,
		'onSuccess': function(req) {
			var obj = eval( "(" + req.responseText + ")" );
			if ( obj.result ) {
				socialFriends();
                closePopupBlock('autoriz-popup');
			} else if ( obj.error ) {
				$('registrationError').show().update(obj.error);
				$('adv-data').show();
			}
		}
	});
}

function checkedAllFriends(checked) {
	var user_list = $$('#' + SportsOAuth2.social + '-friend-list input[type=checkbox]');
	
	for (var i = 0; i < user_list.length ;i++) {
		user_list[i].checked = checked;
	}
	
}

function addSocialFriends() {
	var social = SportsOAuth2.social;
        
	var user_list = $$('#' + social + '-friend-list input[type=checkbox]');
	var friend_list = new Array;
	for (var i = 0; i < user_list.length ;i++) {
		if ( user_list[i].checked ) {
			friend_list.push( user_list[i].value );
		}
	}
	
	new Ajax.Request( '/ajax/user/add_friend.html', {
		'method': 'post',
		'parameters': {'friend_list':friend_list.join(',')},
		'onComplete': function() {
				reloadBrowserWindow();
		}
	});
}

function socialFriends() {
    var social = SportsOAuth2.social;
    
	new Ajax.Updater( social + '-friend-list', '/ajax/social/' + social + '/friends.html', {
		'method': 'get',
        'onSuccess': function(req) {
			showPopup( social + '-add-friend-popup');
		},
		'onFailure': function() {
			reloadBrowserWindow();
		}
	});
}

function restorePassword() {
	var params = new Object();
	params["login"] 	= $('notificationEmail').value;
	params["back_url"] 	= $('autorizationBackURL').value;

	new Ajax.Request( '/ajax/user/restore_password.html', {
		'method': 'post',
		'parameters': params,
		'onSuccess': function(req) {
			var obj = eval( "(" + req.responseText + ")" );

			if ( obj.result ) {
				alert('Пароль выслан на указанный электронный адрес.');
				reloadBrowserWindow();
			}
		}
	});
}

function onFormPressEnter(evt, elem) {
	var keyCode = null;

	if( evt.which ) {
		keyCode = evt.which;
	} else if( evt.keyCode ) {
		keyCode = evt.keyCode;
	}

	if( 13 == keyCode ) {
		$(elem).onclick();
		return false;
	}

	return true;
}

function reloadBrowserWindow() {
	var new_url = parent.location.toString().replace(/#\w+/, '').replace(/p=\d+/, '');
	parent.location.replace( new_url );
	
	var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	if (is_chrome && parent.location.hash != ''){
		parent.location.reload();
	}
	
	location.href = location.search;
}