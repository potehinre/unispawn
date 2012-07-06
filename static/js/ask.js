function display_ask(doc_id, error, comment_id) {
	var url = '/ajax/comments/ask.html';
	var params = 'error=' + error;
	var req = new Ajax.Request( url+'?'+params, {method: 'get', onComplete: function(req) {
		if ( req.responseIsFailure ) {
		} else {
			$('ask_' + doc_id + (comment_id ? '_' + comment_id : '') ).innerHTML = req.responseText;
		}
	}, onFailure: function() {} } );
}

var current_comment_id = null;

function hideAnswerForms() {
	
	if ( current_comment_id != null ) {
		var div = document.getElementById('answer_form_' + current_comment_id);
	
		for (var j=0; j<div.childNodes.length; j++) {
			div.removeChild(div.childNodes[j]);
		}
		
		$('answer_form_' + current_comment_id).update('');
		$('comment_actions_' + current_comment_id ).toggle();
		
		current_comment_id = null;
	}
	
	//elements = document.getElementsByName("answer_href");
	//for (var i=0; i<elements.length; i++) {
	//	elements[i].style.display = '';
	//}
}

function showAnswerForm(comment_id, doc_id, doc_class) {
	hideAnswerForms();
	
	current_comment_id = comment_id;
	
	new Ajax.Updater('answer_form_' + comment_id, '/ajax/comments/answer.html', { 
		parameters: { doc_id:doc_id, comment_id:comment_id, doc_class:doc_class },
		evalScripts: true
	} );
	
	$('comment_actions_' + current_comment_id ).toggle();
	//document.getElementById('answer_href_' + comment_id).style.display = 'none';
}

function voteForQuestion(question_id) {
	new Ajax.Updater('question_' + question_id, '/ajax/conf/vote.html', {
		parameters: { id:question_id } 
	});
}

function toggleComment(comment_id, with_out_atswer) {	
	
	if ( $('answer_href_' + comment_id) && !with_out_atswer ) {
		$('answer_href_' + comment_id).toggle();
	}
	
	if ( $('answer_line_' + comment_id) ) {
		$('answer_line_' + comment_id).toggle();
	}
	
	if ( $('vert_bar_' + comment_id) ) {
		$('vert_bar_' + comment_id).toggle();
	}
	
	$('comment_text_' + comment_id).toggle();
	$('hide_href_' + comment_id).toggle();
	$('show_href_' + comment_id).toggle();
	
	return false;
}
