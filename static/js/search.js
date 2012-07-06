/*
 * 
 */

var DEBUG = false;
var YANDEX_DIRECT_ENABLED = false;
var MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября" ,"октября" ,"ноября" ,"декабря"];

var YandexDirect = new Class.create();
YandexDirect.prototype = {
	initialize: function(wrapper, iframe_name){
		this.wrapper = $(wrapper);
		if (!this.wrapper) return null;
		Element.update(this.wrapper, '<iframe src="" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" id="' + iframe_name + '" style="width:100%;height:0;margin:0;padding:0"></iframe>');
		this.iframe = $(iframe_name);
		Element.hide(this.wrapper);
		var _this = this;
		this.iframe.handle_height = function(height){
			this.style.height = height + 'px';
			if (!height) Element.hide(_this.wrapper);
		}
	},
	print: function(text, p){
		if (typeof YANDEX_DIRECT_ENABLED == 'undefined' || !YANDEX_DIRECT_ENABLED) return false;
		if (text){
			Element.show(this.wrapper);
			this.iframe.src = 'yadirect.html?' + $H({'text': text, 'page-no': p}).toQueryString(); // !!! gotta be toQueryString and nothing else;
		}else Element.hide(this.wrapper);
	}
}

var Search = new Class.create();
Search.prototype = {
	initialize: function(form, submit_btn, found_count_div, results_div, pagination_div, sort_div, error_div, copyright_div, yandex_direct, options){
		this.form = $(form);
		this.input = this.form.text;
		this.select = this.form.title;
		this.submit_btn = $(submit_btn);
		this.found_count_div = $(found_count_div);
		this.results_div = $(results_div);
		this.pagination_div = $(pagination_div);
		this.sort_div = $(sort_div);
		this.error_div = $(error_div);
		this.copyright_div = $(copyright_div);
		Element.hide(this.copyright_div);
		this.yandex_direct = yandex_direct || null;
		
		this.options = {
			url: this.form.action,
			page: 0,
			numdoc: 30,
			how: 'tm', // rlv || tm
			doc_url_redundant: 'webds',
			doc_title_redundant: '',
			hostname: ''
		};
		Object.extend(this.options, options || {});

		this.found_count = 0;

		this.form.onsubmit = this.search.bindAsEventListener(this);
		
		this.initInput();
	},
	initInput: function(){
		if (location.search){
			var text = getQueryParam('text') || getQueryParam('s_string') || null; // !!! no unescape or decodeURIComponent/parseQuery; getQueryParam is global
			if (text) this.search(null, true, text);
		}
	},
	getElemText: function(node){
		return (node.text || node.textContent || (function(node){
			var _result = "";
			if (node == null) {
				return _result;
			}
			var childrens = node.childNodes;
			var i = 0;
			while (i < childrens.length) {
				var child = childrens.item(i);
				switch (child.nodeType) {
					case 1: // ELEMENT_NODE
					case 5: // ENTITY_REFERENCE_NODE
						_result += arguments.callee(child);
						break;
					case 3: // TEXT_NODE
					case 2: // ATTRIBUTE_NODE
					case 4: // CDATA_SECTION_NODE
						_result += child.nodeValue;
						break;
					case 6: // ENTITY_NODE
					case 7: // PROCESSING_INSTRUCTION_NODE
					case 8: // COMMENT_NODE
					case 9: // DOCUMENT_NODE
					case 10: // DOCUMENT_TYPE_NODE
					case 11: // DOCUMENT_FRAGMENT_NODE
					case 12: // NOTATION_NODE
					// skip
					break;
				}
				i++;
			}
			return _result;
		}(node))).strip();
	},
	resetPageIndex: function(){
		this.options.page = 0;
	},
	setInputValue: function(text){
//		this.input.value = text;
	},
	doNav: function(obj){
		this.options.page = obj.className.substring(12) - 1;
		this.search();
		this.form.scrollIntoView(true);
	},
	doSort: function(obj){
		this.options.how = obj.getAttribute('_how');
		this.search(null, true);
		this.form.scrollIntoView(true);
	},
	searchDone: function(request, response){
		var res_doc = request.responseXML;
		this.setInputValue(this.getElemText(res_doc.getElementsByTagName('query')[0])); // !!!
		var error_elem = res_doc.getElementsByTagName('error')[0] || null;
		if (this.yandex_direct) this.yandex_direct.print(error_elem ? '' : $F(this.input), this.options.page); // yandex direct
		if (error_elem){
			Element.update(this.results_div, '');
			Element.update(this.found_count_div, '');
			Element.update(this.pagination_div, '');
			Element.update(this.sort_div, '');
			Element.hide(this.copyright_div);
			Element.update(this.error_div, this.getElemText(error_elem));
		}else{
			this.found_count = this.getElemText(res_doc.getElementsByTagName('found')[2]); // priority="all", used in a few places
			Element.update(this.error_div, '');
			Element.update(this.results_div, this.getResItems(res_doc));
			Element.update(this.found_count_div, this.getFoundCount(res_doc));
			Element.update(this.sort_div, this.getSortOptions(res_doc));
			Element.update(this.pagination_div, this.getNavOptions());
			Element.show(this.copyright_div);
			var _this = this;
			$A(this.sort_div.getElementsByTagName('a')).each(function(a){
				a.onclick = function(e){
					_this.doSort(a);
				}
			});
			$A(this.pagination_div.getElementsByTagName('a')).each(function(a){
				a.onclick = function(e){
					_this.doNav(a);
				}
			});
		}
	},
	search: function(e, first_time, text, title){
		var e = e || window.event;
		var first_time = (first_time) || (e && e.type == 'submit');
		var text = text || encodeURIComponent($F(this.input)) || null; // !!! gotta be encoded
		var title = title || encodeURIComponent($F(this.select)) || null; // !!! gotta be encoded
		if (e) Event.stop(e);
		if (first_time) this.resetPageIndex();
		if (text){
			var pars = 'text=';
			
			if (title) {
				pars += encodeURIComponent('(') + text + encodeURIComponent(' && title [') + title + encodeURIComponent('])');
			} else {
				pars += text;
			}
			pars = pars + '&p=' + this.options.page + '&numdoc=' + this.options.numdoc + '&how=' + this.options.how + '&xml=yes';
			
			var req =new Ajax.Request(
			this.options.url + '?' + pars, // !!! no 'parameters'
			{
				method: 'get',
				onComplete: this.searchDone.bind(this)
			});
			
			new Ajax.Updater('one-box', '/ajax/search/one_box.html', { parameters: { query:$F(this.input), control_charset:$F(this.form.control_charset), sname:$F(this.select) } });
		}
	},
	getFoundCount: function(res_doc){
		return 'Найдено документов: ' + this.found_count;
	},
	getHighlightedText: function(node){
		if (!node) return '';
		$A(node.getElementsByTagName('hlword')).each(function(hlword){
			if (hlword.firstChild) hlword.firstChild.nodeValue = 'START_HL_WORD' + hlword.firstChild.nodeValue +  'END_HL_WORD';
		});
		return this.getElemText(node).replace(/START_HL_WORD/gi, '<strong>').replace(/END_HL_WORD/gi, '</strong>');
	},
	getResItems: function(res_doc){
		var s = '';
		var _this = this;
		var page_first = res_doc.getElementsByTagName('page')[1].getAttribute('first');
		var index = 0;
		$A(res_doc.getElementsByTagName('doc')).each(function(doc){
			var date = _this.getElemText(doc.getElementsByTagName('modtime')[0]);
			var y = date.substring(0, '0000'.length);
			var d = date.substring('0000-00-'.length, '0000-00-00'.length);
			var m = MONTHS[parseInt(date.substring('0000-'.length, '0000-00'.length), 10)-1];
			var t = date.substring('0000-00-00 '.length, '0000-00-00 00:00'.length);
			var url = _this.getElemText(doc.getElementsByTagName('url')[0]).substring(_this.options.doc_url_redundant.length);
			url = url.replace(/[&\?]print=1/, '').replace(/[&\?]internal=1/,'').replace(/[&\?]last_modified=\w{3}_\d{2}_\w{3}_\d{4}_\d{2}%\w{4}%\w{4}/,'');
			var title = _this.getElemText(doc.getElementsByTagName('title')[0]);
			title = title.substring(title.indexOf('Sports.ru', 0), title.length - 1 );
			s += '<li value="' + (page_first++) + '"><p><a href="/' + url + '" target="_blank">' + title + '</a></p><p>' + _this.getHighlightedText(doc.getElementsByTagName('passages')[0]) + '</p><p><span>http:/' + _this.options.hostname + url +  ' | '+d+' '+m+' '+y+' '+t+'</span></p></li>';
		});
		return s;
	},
	getNavOptions: function(res_doc){
		var p = this.options.page ? this.options.page + 1 : 1;
		var n = this.options.numdoc;
		var size = 12;
		var total = this.found_count;
		var delimiter = '&nbsp;|&nbsp;';
		
		var parts = Math.floor(total/n) + (total % n ? 1 : 0);
		
		if ( parts <= 1 ) {
			return '';
		}
		
		var mid_position = Math.round(size/2);
		var left_pushed_border = mid_position;
		var right_pushed_border = parts - mid_position;

		var result = '';
		var left_border;
		var right_border;
		
		if ( p <= parts - left_pushed_border ) {
			left_border = p + mid_position - 1;
			right_border = left_border - size + 1;
		} else {
			left_border = parts;
			right_border = parts - size;
		}

		if ( right_border < 1 ) {
			left_border = size;
			right_border = 1;
		}
		if ( left_border > parts ) {
			left_border = parts;
		}
		
		if ( right_border > 1 ) {
			result += '<a href="javascript:void(0)" class="ajax-search-1">в начало</a>' + delimiter;
		}
		
		var parts_arr = [];
		
		for ( var pn = right_border; pn <= left_border; pn++ ) {
			parts_arr.push( pn == p ? "<span>" + pn + "</span></li>" : "<a class=\"ajax-search-" + pn + "\">" + pn + "</a>" );
		}
		
		result += parts_arr.join(delimiter);

		if ( left_border < parts ) {
			result += delimiter + '<a href="javascript:void(0)" class="ajax-search-' + parts + '">в конец</a>';
		}
		
		return result;
	},
	getSortOptions: function(res_doc){
		var how_rlv = this.options.how == 'rlv' ? '<span>по релевантности</span>' : '<a href="javascript:void(0)" _how="rlv">по релевантности</a>';
		var how_tm = this.options.how == 'tm' ? '<span>по дате<span>' : '<a href="javascript:void(0)" _how="tm">по дате</a>';
		return 'сортировка: ' + how_rlv + ' &nbsp;|&nbsp; ' + how_tm;
	}
}
