function display_answers(poll_id, left_column, status, answer_id) {
	var re = new RegExp(poll_id+',');
	var URL = '/ajax/poll/';
	var re = new RegExp(poll_id+',');
	var method = answer_id > 0 ? 'post' : 'get';
	
	if ( !answer_id && ( status == 2 || re.test(readCookie('poll_vote')) ) ) {
		URL+='results.html';
	} else {
		URL+='answers.html';
	}
	var params = 'id=' + poll_id+'&left_column='+left_column + ( answer_id > 0 ? '&answer_id=' + answer_id : '' );
	
	var req = new Ajax.Request( URL+'?'+params, {  method: method, onComplete: function(req) {
		if ( req.responseIsFailure ) {
		} else {
			$('answers_list_' + poll_id).innerHTML = req.responseText;
		}
	}, onFailure: function() {} } );
}

function display_outer_poll(poll_id, host) {
	var URL = host+'ajax/poll/outer.html';
	var params = 'id=' + poll_id;
	var req = new Ajax.Request( URL+'?'+params, {  method: 'get', onComplete: function(req) {
		if ( req.responseIsFailure ) {
		} else {
			$('sports_answers_list_' + poll_id).innerHTML = req.responseText;
		}
	}, onFailure: function() {} } );
}

function readCookie(name) {
  if (document.cookie.indexOf(name) != -1 &&
  document.cookie.length != name.length) {
    var starts = document.cookie.indexOf(name)
    var endstr = document.cookie.indexOf(";",starts)
    if (endstr == -1) endstr = document.cookie.length
    return unescape(document.cookie.substring(starts,endstr))
  }
}

function showPollCaptcha(img_id) {
	document.getElementById('poll-captcha').style.display = 'block';
	
	document.getElementById('poll-captcha-img').src = '/auth_image/?' + img_id;
}
