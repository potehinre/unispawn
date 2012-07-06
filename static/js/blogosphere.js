
/* for tribuna 'widgets' */
function observe_help_block(show) {
    if (!show) return;

    document.observe("dom:loaded", function() {

        Cookies.set_domain('');
        var c = Cookies.get('tribuna-about-help');
        if (!c) {
            $('about-help').show();
        }
        //Cookies.set('tribuna-about-help', 1, 0);

        $('about-help-close').observe('click',function(){
            Cookies.set('tribuna-about-help', 1, 24 * 365 );
            $('about-help').hide();
        });

    });
}

function observe_users_block(id_prefix, url_prefix, dict) {
    
    observe_right_block(id_prefix, url_prefix);

    document.observe("dom:loaded", function() {
        var select_id = id_prefix + '-select';
        set_users_block_desc( $( select_id ), id_prefix, dict );

        $( select_id ).observe('change', function(event) { 
            set_users_block_desc( this, id_prefix, dict );
        })
    });
}


function set_users_block_desc (sel_elem, id_prefix, dict) {
    if (sel_elem.selectedIndex == -1) { return; }

    var value = sel_elem.options[sel_elem.selectedIndex].value;
    var info_elem_id = id_prefix + '-info';
    $( info_elem_id ).update( dict[value] );
}

function observe_right_block (id_prefix, url_prefix) {
    var select_id = id_prefix + '-select';
    document.observe("dom:loaded", function() {
        set_right_block(  $( select_id ), id_prefix, url_prefix );
        $( select_id ).observe('change', function(event) { 
                set_right_block( this, id_prefix, url_prefix );
            }
        );

    });
}

function set_right_block( sel_elem, id_prefix, url_prefix ) {
    var widget_id = id_prefix + '-widget';
    if (sel_elem.selectedIndex == -1) { return; }
    var value = sel_elem.options[sel_elem.selectedIndex].value;
    var show_id   = id_prefix + '-' + value;
    var childs = $( widget_id ).descendants();
    var ids = '';
    for(i=0; i < childs.length; i++ ) {
        var c = childs[i];
        var id = c.id;
        if (id) {
             ids = ids + id;
             if ( id == show_id ) {
                 $( id ).setStyle({ display: 'block' });
             }
             else if( id.search(id_prefix) != -1 ) {
                 if (   id.search('select') == -1 
                     && id.search('info') == -1 )
                 {
                     $( id ).setStyle({ display: 'none' });
                 }
             }
        }
    }

    var href_id = id_prefix + '-href';
    $( href_id ).href = url_prefix + "?view=" + value;
}


/* Rates functions */

function rate_act(event, observer) {
    var uri;

    if ( event.element().href ) {
        uri = event.element().href;
    }
    else {
        uri = event.element().up().href; // if click on href child
    };
    uri += '&format=json';
    if ( $( observer.link_id ).disable ) {
        return;
    }
    $( observer.link_id ).disable = true;
    
    new Ajax.Request( uri, {
        method: 'post',
        onComplete: function(response) {
            if (200 == response.status) {
                var text = response.responseText || '{}';

                // TODO : process wrong format
                $( observer.message_id ).update('');
                if (observer.p_executor) { observer.p_executor.stop() } // conflicts

                var data = text.evalJSON();

                if (data.message_ok) {
                    var new_rate = data.rate_after;
                    var sign = new_rate > 0 ? '+' :
                               new_rate < 0 ? '&minus;' : '&nbsp;';
                    var style = new_rate < 0 ? 'r-red'   : 
                                new_rate > 0 ? 'r-green' : 'r-grey';
                    var rate_out = sign + '&nbsp;' + Math.abs( new_rate );
                    var rate_info = "плюсов  - " + data.rate_plus + "<br/>" +
                                    "минусов - " + data.rate_fuuu + "<i></i>";
                    var rate_message = 'Спасибо! Ваш голос учтен.'
                    $( observer.message_id ).className = 'r-green';
                    $( observer.message_id ).update( rate_message );
                    $( observer.rate_out_id ).className = style;
                    $( observer.rate_out_id ).update( rate_out );
                    $( observer.rate_info_id ).update( rate_info );

                    var href_class  = observer.class_prefix;
                    $( observer.link_id ).removeClassName( href_class );
                    $( observer.link_id ).addClassName( href_class + '-active' );

                    $( observer.link_id ).disable = false;
                }
                else {
                    var err_str = data.error;
                    $( observer.message_id ).className = 'r-red';
                    $( observer.message_id ).update( err_str );
                    $( observer.link_id ).disable = false;
                }

                observer.p_executor = new PeriodicalExecuter(function(pe) {
                    $( observer.message_id ).update('');
                    pe.stop();
                }, 5);
            }
        }
    });
}

function create_rate_mover_observers() {
    document.observe("dom:loaded", function() {
        $$('.r-tape')
               .each(function(item){
                    var msg = item.down('.r-info');
                    msg.setStyle({ 'left': msg.positionedOffset()[0] + 5 + 'px' })
                })
              .invoke('observe','mouseover',
                function(){
                    var msg = this.down('.r-info');
                    msg.show();
                })
              .invoke('observe','mouseout',
                function(){
                    this.down('.r-info').hide();
                });
    });
}

function create_rate_ahref_observers(suffix) {

    var observer = new Object();
    observer.message_id   = "r_message" + suffix;
    observer.rate_out_id  = "r_out"     + suffix;
    observer.rate_info_id = "r_info"    + suffix;

    var minus_id = "a_minus" + suffix;
    $( minus_id ).observe( "click", function(event) { 
        observer.link_id    = "a_minus" + suffix;
        observer.class_prefix = "r-minus";
        rate_act(event, observer);
    } );

    var plus_id = "a_plus" + suffix;
    $( plus_id ).observe("click", function(event) { 
        observer.link_id    = "a_plus" + suffix;
        observer.class_prefix = "r-plus";
        rate_act(event, observer);
    } );
 
    return;
}

/* other functions */
function toggleBSIndex(type, tab, el) {
	var menu = $(type + '-menu');
	
	menu.childElements().invoke('removeClassName', 'active');
	
	$(el).up(2).addClassName('active');
	
	$(type).childElements().each( function(s) { 
        if ( s.identify() != type + '-menu' && !s.hasClassName('hidden') ) {
            s.addClassName('hidden'); 
        }
    });
	
	$(type + '-' + tab).removeClassName('hidden');
}
