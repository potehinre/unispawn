//var Users_with_popup_block = new Hash();
/*
if (typeof(console) == 'undefined') {
    console = {
        'log'  : function(message) {},
        'info' : function(message) {},
        'warn' : function(message) {},
        'error': function(message) {
            alert(message);
        }
    }
}
*/

var defaultMikroblogText = 'Пара слов о матче?';
// id скрытой кнопки "ответить"
var statusFeedFirstPage = 0;
var maxMikroblogTextLength = 140;
// FIXME : move from global var to params
//var lastRefreshedCommentsStatusId = 0;
var currentUserBlockData = new Object;
var hideUserBlockTimeoutID;

function checkStatusLength() {
    checkInputLength($('newStatusText'), maxMikroblogTextLength, 'statusLength');
}

function SetStatusEmptyValue() {
    if ( $('newStatusText').value == defaultMikroblogText) { 
        $('newStatusText').value = '';
        setDefaultValueToInput($('newStatusText'), '', 'statusLength', maxMikroblogTextLength);
    }
}

function showMikroblogInput(event) {
    if(event) { event.stop(); }
    //alert( 'showMicroblogInput' );
    if ( $('mikroBlogText').empty() ) {
        $('hideStatusButton').hide();
    }
    else {
        $('hideStatusButton').show();
    }
	$('oldStatus').hide();
    var currentDate = new Date();
    var moscowDate  = new Date( currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours() + 4  );
    var defText = defaultMikroblogText;
    if ( (moscowDate.getMonth() == 3) && (moscowDate.getDate() == 1) ) {
        defText = "У вас спина белая!";
    }
    $('newStatusText').value = defText;
    $('newStatus').show();

	refreshInputLength('newStatusText', 'statusLength', maxMikroblogTextLength);
	return false;
}

function hideMikroblogInput(event) {
    if(event) { event.stop() }
    // if first status set we must unhide button
    $('hideStatusButton').show();

    $('newStatus').hide();
	$('oldStatus').show();

 	return false;
}


function saveMikroblogStatus(event) {
    // checks
	var newStatus = $('newStatusText').value;
    if ( newStatus == defaultMikroblogText) { 
        newStatus = '';
    }
    if(newStatus) {
        newStatus.trim();
    }
    if (!newStatus) {
        alert("Нельзя устанавливать пустой статус.") ;
        return;
    }
    if ( newStatus.length > maxMikroblogTextLength ) {
        alert("Размер текста статуса превышает максимально разрешенное значение.");
        return;
    }
    //console.log( 'newStatus =', newStatus );
// set statys
	new Ajax.Request( '/ajax/user/status/set.html', {
        'method': 'post',
        'parameters': { 'text': newStatus,
                        'control_charset': $('control_charset').value },
        'onSuccess': function(req) { 
            var obj = req.responseText.evalJSON();
            var err_str = 'Не удалось установить статус.';

            if(!obj) {
                obj = { 'id': "0" };
            }

            if ( obj.id == 0) {
                if ( obj.stop_words ) {
                    err_str = err_str + "\nВ статусе содержатся недопустимые слова или ссылки: "
                            + obj.stop_words.join(', ') + '.';
                } 
                else {
                    err_str = err_str + "\n" + obj.error_str;
                }
                alert( err_str );
                return;
            }

            updateStatusOnPage( obj.id );
            $('microBlogRetweet').innerHTML = '';
		}
        , 'onFailure': function() {
            alert('Ошибка установки статуса!');
        }
    });	

	return false;
}

function updateStatusOnPage(status_id) {
	new Ajax.Updater({ 'success': 'mikroBlogText' },
	    '/ajax/user/status/get.html', {
			'method': 'get',
			'parameters': { 'status_id': status_id, 'hide': 1 },
            'onComplete': function(res) {
                var st_elem = $('status' + status_id);
                if (!st_elem) return;

                var found = st_elem.down('div[class="text"]');
                if (!found) return;

                var found_p   = found.down('p');
                var status_html= found_p.innerHTML;
                if ( statusFeedFirstPage ) {
                    $('statusFeed').insert({'top': st_elem});
                    st_elem.show();
                }

                status_html = status_html.replace( 
                    'retweet-arrow.gif', 'retweet-arrow-white.gif');
                $('mikroBlogText').innerHTML = status_html;
                hideMikroblogInput(null);
            }
        });

}

function removeDeletedStatusFromFeed(status_id) {
	var elem = $('status' + status_id);
	if ( elem ) {
		elem.update('Статус был удален.');
	}
}

function onCommentTextareaPressKey(evt) {
	var keyCode = null;

	if( evt.which ) {
		keyCode = evt.which;
	} else if( evt.keyCode ) {
		keyCode = evt.keyCode;
	}

    if ( (evt.ctrlKey) && (( keyCode == 0xA ) || ( keyCode == 0xD )) ) {
        sendCommentToStatus(null);
    }
    
}

function onMikroblogStatusPressKey(evt, elem_id) {
	var keyCode = null;

	if( evt.which ) {
		keyCode = evt.which;
	} else if( evt.keyCode ) {
		keyCode = evt.keyCode;
	}

	if( 13 == keyCode ) {
        evt.stop();
		$(elem_id).click();
		return false;
	}

	return true;
}

function retweetMikroblogStatus(event, id) {
    if (event) { event.stop(); }

	document.body.style.cursor = "wait";
	new Ajax.Request( '/ajax/user/status/retweet.html', {
			'method': 'get',
			'parameters': { 'status_id': id },
			'onSuccess': function(req) {
                var err = 'Ошибка: не удалось забрать статус!';
                var obj = req.responseText.evalJSON();
                
				if ( obj.result && (obj.result == true) ) {
					alert('Статус установлен.');
                    if (event) { event.element().hide(); }
				} 
                else {
                    if (obj.error_str) {
                        err = err + "\n" + obj.error_str;
                    }
                    alert(err);
				}
			}
            , 'onComplete': function() {
                document.body.style.cursor = "default";
            }
            , 'onFailure': function() {
                alert('Ошибка: не получилось забрать статус!');
            }
		}
	);

	return false;
}

function deleteMikroblogStatus(event, status_id) {
    if(event) { event.stop(); }

	if ( !confirm('Вы действительно хотите удалить этот статус?') ) {
		return false;
	}

    if(!status_id) {
        alert("Ошибка: не задан статус, который нужно удалять!")
        return false;
    }
	//status_id = id ? id : $('statusId').value;

	new Ajax.Request( '/ajax/user/status/delete.html', {
			'method': 'get',
			'parameters': { 'status_id': status_id },
			'onSuccess': function(req) {
                var obj = req.responseText.evalJSON();

				if ( ! obj.result ) {
                    alert('Ошибка удаления статуса!');
                    return;
                }

                var profile_re = /profile/;
				if ( obj.clean_status && profile_re.test(document.location) ) {
                    resetStatusInput();
				}

				if ( $('status' + status_id) ) {
					removeDeletedStatusFromFeed(status_id);
				}

				alert('статус удален');
			}
            , 'onFailure': function() { alert('Ошибка удаления статуса!'); }
		}
	);
	return false;
}

function resetStatusInput() {
    $('mikroBlogText').update('');
    showMikroblogInput(null);
    if ( $('hideStatusButton') ) $('hideStatusButton').hide();
}

function resetMikroblogStatus(event) {
    if(event) { 
        event.stop(); 
    }

	if ( !confirm('Вы действительно хотите сбросить этот статус?') ) {
		return false;
	}

    var reset_link = $('resetStatusLink').href;
    if (!reset_link) return ;

	new Ajax.Request( reset_link, {
			'method': 'get',
			'onSuccess': function(req) {
                var obj = req.responseText.evalJSON();

				if ( !obj || !obj.result ) {
                    alert('Ошибка сброса статуса!');
                    return;
                }

                resetStatusInput();
			}
            , 'onFailure': function() { alert('Ошибка сброса статуса!'); }
		}
	);
	return false;
}

function hideCommentTextarea( event ) {
    if (event) { event.stop(); }
    $("unique_comment_block").hide();
	
	if ( $('comment_id').value ) {
        $('comment_actions_' + $('comment_id').value ).toggle();	
	}
/*
    var message_id = $('comment_message_id').value;
    if (!message_id) return;

    if ( message_id &&  $('status_href_' + message_id) ) {
        $('status_href_' + message_id).show();
    }
*/
}

// TODO : move calc parent_id to code (remove 2nd param)
function moveCommentTextarea( event, parent_id, param ) {
    var comment_form = $("unique_comment_block");
    if (event) { event.stop(); }
   
    if (param) {
        if ( param.message_id ) {
            $('comment_message_id').value = param.message_id;
        }
		
		if ( param.comment_id ) {
			if ( $('comment_id') ) {
				$('comment_id').value = param.comment_id;
			}
			
            $('comment_actions_' + param.comment_id).toggle();
        }
    }

    if ( $(parent_id).down('[id=unique_comment_block]') ) {
        //console.log("found child!");
    }
    else {
        $( parent_id ).appendChild( comment_form );
    }
    $('fft-answer').value = '';
    comment_form.show();
	hideUserModule();
}

function user_block_is_over() {
    hideUserBlockTimeoutID = setTimeout( function() {
        hideUserModule();
        }, 500);
}


function onShowCommentPressCtrlEnter(event, formElem) {
	if ( (event.ctrlKey) && (( event.keyCode == 0xA ) || ( event.keyCode == 0xD )) ) {
		//sendCommentToStatus();
	}
}

function sendCommentToStatus(event) {
    if (event) { event.stop(); }

    var data = $('status_comment_form').serialize({'hash': true});
    data.ajax = 1;

    var elem_parent = $('unique_comment_block').up("div");
    var parent_comment_id = elem_parent.id;
    var id_re = /_(\d+)$/;
    if ( parent_comment_id && id_re.test(parent_comment_id) ) {
        var arr = id_re.exec( parent_comment_id );
        data["comment_id"] = arr[1]; // parent comment id
    }

	$("fft-answer").disable();
	document.body.style.cursor = "wait";

    var parent_id = 'prevComments' + data.message_id;
	new Ajax.Updater({ 'success': parent_id },
		'/ajax/comments/submit.html', {
			'method':   'post',
			'parameters': data,
			'insertion': Insertion.Bottom,
			'onSuccess': function(response) {
                if ( $('error_message') ) {
                    $('error_message').remove(); // must be unique
                }
				hideCommentTextarea();
			},
			'onComplete': function() {
				document.body.style.cursor = "default";
                $("fft-answer").enable();
                if ( ! $('error_message') ) {
                    var childs = $( parent_id ).childElements();
                    var last_comment = childs[ childs.size() - 1 ];
                    last_comment.scrollTo();
                    setTimeout( refreshCommentsCount(data['message_id'], 1), 500);
                    //console.log('after timeout'); // WTF?
                    //alert('after timeout');
                }
			}		
            , 'onFailure': function() { alert('Ошибка добавления комментария!'); }
		}
	);
}


function forbidUserComment(user_id, userName) {
	new Ajax.Request( '/ajax/user/status/add_foe.html', {
			'method': 'post',
			'parameters': { 'user_id': user_id },
			'onComplete': function(req) {
                var obj = req.responseText.evalJSON();
				if ( obj && obj.result == 1 ) {
					alert('Пользователь ' + userName + ' больше не сможет комментировать ваши статусы.');
				}
                else {
                    alert('Ошибка добавления бана!');
                }
			}
            , 'onFailure': function() { alert('Ошибка добавления бана!'); }
		}
	);
}

function deleteStatusComment(status_id, comment_id, user_id, userName) {
	if ( !confirm('Вы действительно хотите удалить этот комментарий?') ) {
		return false;
	}

	var div = $('statusComment' + comment_id);
	document.body.style.cursor = "wait";
	new Ajax.Request( '/ajax/user/status/delete_comment.html', {
				'method': 'post',
				'parameters': { 'status_id': status_id, 'comment_id': comment_id, 'user_id': user_id },
				'onSuccess': function(req) {
                    var obj = req.responseText.evalJSON();

					div.update('');
                    if (! obj.result ) {
                        alert('Ошибка удаления комментария!');
                        return;
                    }

					if ( obj.make_foe != 1) {
						alert('Комментарий удален.');
					} 
                    else {
                        if ( confirm('Комментарий удален.' + '\n' 
                            + 'Вы хотите запретить пользователю ' + userName 
                            + ' оставлять комментарии к вашим статусам?') ) 
                        {
                            forbidUserComment(user_id, userName);
                        }
                    }
                    //lastRefreshedCommentsStatusId = status_id;
                    setTimeout(refreshCommentsCount(status_id, -1), 500);
				},
				'onComplete': function() {
					document.body.style.cursor = "default";
				}
                , 'onFailure': function() {
                    alert('Ошибка удаления комментария!');
                }
			}
	);
	return false
}

function refreshCommentsCount(id, delta) {

	var href_id = 'status_comments_count_href_' + id;
    var href_elem = $( href_id );

	if ( href_elem ) {
		var count = delta + parseInt(href_elem.innerHTML);
		href_elem.update(count);
	}
}

function updateUserModule(elem, params) {
    if (!params.user_id) {
        return;
    }

	document.body.style.cursor = "wait";
    new Ajax.Updater( {'success': document.body },
        '/profile/user_status_block.html', {
            'method': 'get',
            'parameters': { 'user_id': params.user_id },
            'insertion': 'top',
            'onSuccess' : function() {
                var u_mod = $('userModule');
                if (u_mod) {
                    u_mod.remove();
                }
            },
            'onComplete': function() {
                document.body.style.cursor = "default";
                //updateUserModule(elem, params);
                //$('userModule').sho;
                positioningUserModule(elem);
                currentUserBlockData.user_id = params.user_id;
            }
        }
    );
}

function positioningUserModule(elem) {
    var u_mod = $('userModule');
    if(!u_mod) { return; }

    if(!elem)  { return; }

	var elem_offset = elem.cumulativeOffset();
    var mod_sizes = u_mod.getDimensions();
    var offset_left = (elem_offset.left + elem.getWidth() + 2) + 'px';
	var offset_top  = (elem_offset.top 
                         - Math.ceil( mod_sizes.height / 2 ) 
                         + Math.ceil( elem.getHeight() / 2) ) 
                         + 'px';
	u_mod.style.left = offset_left;
	u_mod.style.top  = offset_top;

	u_mod.show();
    currentUserBlockData.elem = elem;
}

function undo_hide_UserModule() {
    if (hideUserBlockTimeoutID) {
        clearTimeout(hideUserBlockTimeoutID);
    }
}

function showUserModule(event, hover_block, user_id, status, comment_id) {
	var params = {'user_id': user_id};

    undo_hide_UserModule();

    if (currentUserBlockData.elem && (currentUserBlockData.elem == hover_block) ) 
    {
        positioningUserModule(hover_block);
        return;
    }
    if ( currentUserBlockData.user_id && (currentUserBlockData.user_id == params.user_id) )
    {
        positioningUserModule(hover_block);
        return;
    }

    updateUserModule(hover_block, params);
    return; 
}

function hideUserModule() {
    var u_mod = $('userModule');
    if(u_mod) {
        u_mod.hide();
    }
}

document.observe('dom:loaded', function(event) { 
    document.observe('click', hideUserModule); 
});

function hideLastComments(status_id) {
	$('prevComments' + status_id).update();
	return false;
}


