/* 'My Team News' feature functions; */
// TODO : to class, urls to config hash
// type: cookie_name
var cookie_store_time = new Hash({
  user: -1,
  nouser: 24*365*2
});
var store_cookie_type = 'nouser'; // default value
var store_cookie_name = new Hash({ 
  user:  'favteam_user_def', // redefined in comps 
  nouser:'favteam0_def' 
});
var mainHelp = 'В этом блоке будут выводиться последние новости о вашей любимой команде. ';
var helpText = [
	{'select' : 'выберите вид спорта', 
	 'help' : 'Выберите вид спорта, в котором она выступает.' },
	{'select' : 'выберите чемпионат', 
	 'help' : 'Выберите чемпионат, в котором она выступает.' },
	{'select' : 'выберите команду', 
	 'help' : 'Выберите команду.' }
];

var reqStep = new Hash({
	'select_sport'      : { 'text': helpText[0], 'order': 1 },
	'select_tournament' : { 'text': helpText[1], 'order': 2 },
	'select_team'       : { 'text': helpText[2], 'order': 3 } 
});

// find next step name (oreder hardcoded in reqsOrder array
function findNextStep(step_name) {
	var reqsOrder = [ 'select_sport', 'select_tournament', 'select_team' ];
	var next_idx = -1;
	reqsOrder.find(function(item,index) {
		if (item == step_name ) {
			next_idx = index + 1;
			return true;
		}
	});

	// TODO: reqsOrder.size() > next_idx
	var next_step = reqsOrder[next_idx];
	return next_step;
}

// set help phrase by phase(step) name
function setStepHelpPhrase(step_name) {
	$('helpText').update(mainHelp + reqStep.get(step_name).text.help);
	$('topOpt').update('' + reqStep.get(step_name).text.select );
}

// switch news / configuration
function toggleMyTeamCfg() {
	$('favTeamSwitch').toggleClassName('open');
	if ( $('favTeamSwitch').hasClassName('open') ) {
		$('team_news').hide();
		fetchTeamSettings();
		$('team_settings_block').show();
	}
	else {
		$('team_news').show();
		$('team_settings_block').hide();
	}
	
	return false;
}

// fetch settings block
function fetchTeamSettings() {
	$('helpText').update("идет загрузка...");
	new Ajax.Updater({ 'success':'team_config' }, 
		'/ajax/user/fav_team_news_setup.html', {
			method: 'get',
			onComplete: function(response) {
				setStepHelpPhrase('select_sport'); // first step
			},
			onFailure: function(response) {
				$('helpText').update("<a href='/errors/500.html'>ошибка получения данных</a>");
			}
		}
	);
}

// call on change 'select', in config block
function sendFavCfg(elem) {
	var req_step = $('reqType').value;

	if ( req_step == 'select_team' ) {
		if ( elem.value > 0 ){
			$('teamSubmitButton').enable();
		} else {
			$('teamSubmitButton').disable();
		}
		return false;
	}

	// if 0-elem
	if ( !(elem.value > 0) ) { return; }
	
	var url = '/ajax/user/store_fav_team.html';
	new Ajax.Request( url, { 
		method: 'get', 
		parameters: { 'obj_id': elem.value, 'req_type': req_step }, 
		onFailure: function(res) {
			// alert('FAIL GET : ' + url ); // DEBUG
		},
		onSuccess: function(req) {
			var obj = eval( "(" + req.responseText + ")" );
			
			var i, sel, total;
			sel = $('favTeamSel');
			
			total = sel.length;
			for( i=0; i<total; i++ ){
				sel.remove(1);
			}
			
			var current_step = findNextStep(req_step);
			setStepHelpPhrase(current_step);

			if ( current_step == 'select_team' ) {
				$('teamSubmitButton').removeClassName('hidden');
				$('teamSubmitButton').disable();
			}

			$('reqType').value = current_step;

			for( i=0; i < obj.data.length; i++ ) {
				var opt = document.createElement('option');
				opt.value = obj.data[i].id;
				opt.update(obj.data[i].name);

				sel.appendChild(opt);
			}
	} } );
}

// get team news: fav_team_news_list.html?tag_id=<id>
function getMyTeamNews(tag_id) {
	$('team_news').update(); // clear
    $('team_news').insert('<p class="info" id="team_news_info">');
    $('team_news_info').update("идет загрузка...");
    $('team_news').show();
	new Ajax.Updater( { 'success': 'team_news' }, 
		'/ajax/user/fav_team_news_list.html', { 
			method: 'get', 
			parameters: { 'tag_id': tag_id },
			onSuccess: function(response) {
				$('favTeamSwitch2').show();
			},
			onFailure: function(response) {
				$('team_news_info').update("<a href='/errors/500.html'>ошибка получения данных</a>");
			}

		});
	
}

// save fav team selection and show news 
function saveFavTeam() {
	var tag_id = $('favTeamSel').value;
	$('favTeamForm').request( {
			parameters: {
				obj_id: tag_id, 
				req_type: 'store_team'
			} } );

	Cookies.set( store_cookie_name.get(store_cookie_type), tag_id, 
	             cookie_store_time.get(store_cookie_type) );

	$('favTeamSwitch').toggleClassName('open');
	$('team_settings_block').hide();
	$('hide_favteam_block').hide();

	getMyTeamNews(tag_id);
}

// remove fav team block
function hideFavBlock() {
	Cookies.set(store_cookie_name.get(store_cookie_type), '0',
				cookie_store_time.get(store_cookie_type));

	if (store_cookie_type == 'user') {
		new Ajax.Request( '/ajax/user/store_fav_team.html', { 
			method: 'post', 
			parameters: { 'obj_id': '0', 'req_type': 'store_team' }, 
			onFailure: function(res) {
				//alert('not store 0'); //
			},
			onSuccess: function(req) {
				//alert('store 0'); //
			}
		});
	}
	$('favTeamNews').hide();
}
