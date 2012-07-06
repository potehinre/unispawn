var GEO = new Class.create();
GEO.prototype = {
	initialize: function(top_select_obj, div_prefix, no_top_select){
		var no_top_select = no_top_select || false;
		
		this.top_select_obj = $(top_select_obj || 'top_select');
		if (!this.top_select_obj && !no_top_select) return null;
		this.div_prefix = div_prefix;
		this.geo_data = [{name: 'country', id: 0, text: ''}, {name: 'region', id: 0, text: ''}, {name: 'city', id: 0, text: ''}];

		this.select_obj_name_regexp = "([a-z]+)_id";
		this.select_new_city_text = '(выбрать другой город...)';
		this.loading_text = 'Загрузка...';

		this.resetGeoDataIndex();
	},
	getGeoHTMLSelectPointer: function(geo_data_name){
		return $(this.div_prefix + '_' + geo_data_name + '_select');
	},
	getGeoHTMLSelectsDivPointer: function(){
		return $(this.div_prefix + '-geo-selects');
	},
	getGeoHTMLWrapperPointer: function(){
		return $('ajax-' + this.div_prefix + '-geo-wrapper');
	},
	resetGeoDataIndex: function(){
		this.geo_data_index = 0;
	},
	increaseGeoDataIndex: function(){
		return ++this.geo_data_index;
	},
	registerAllGeoHTMLSelectHandlers: function(){
		while (this.geo_data[this.geo_data_index]){
			if (this.registerGeoHTMLSelectHandler()) this.increaseGeoDataIndex();
			else break;
		}
		this.resetGeoDataIndex();
	},
	getRuntimeGeoDataIndex: function(select_obj){
		var select_obj_name = select_obj.name.match(new RegExp(this.select_obj_name_regexp, "i"))[1];
		var i = 0;
		var geo_data = null;
		while (geo_data = this.geo_data[i]){
			if (geo_data.name == select_obj_name) return i;
			i++;
		}
		return 0;
	},
	changeGeoHTMLSelect: function(e){
		el = Event.element(e);
		this.geo_data_index = this.getRuntimeGeoDataIndex(el); // !!!
		geo_data = this.geo_data[this.geo_data_index];
		//alert('geo_data.name=' + geo_data.name + '\n' + 'geo_data.id=' + geo_data.id + '\n' + 'this.geo_data_index=' + this.geo_data_index);
		try {
			tmp_geo_data = geo_data;
			var i = this.increaseGeoDataIndex(); // !
			while (tmp_geo_data = this.geo_data[i]){
				tmp_geo_data.id = 0;
				tmp_geo_data.text = '';
				if (sel = this.getGeoHTMLSelectPointer(tmp_geo_data.name)){
					sel.disabled = true;
					sel.innerHTML = '';
				}
				i++;
			}
		}
		catch (e) {}
		geo_data.id = el.value;
		if (el.value) this.getGeoHTMLSelect();
	},
	registerGeoHTMLSelectHandler: function(){
		geo_data = this.geo_data[this.geo_data_index];
		if (!geo_data){
			this.resetGeoDataIndex();
			return false;
		}
		if ((sel = this.getGeoHTMLSelectPointer(geo_data.name)) && (this.geo_data[this.geo_data_index + 1])){
			//alert(geo_data.name);
			sel.onchange = this.changeGeoHTMLSelect.bindAsEventListener(this);
		}else{
			this.resetGeoDataIndex();
			return false;
		}
		return true;
	},
	getGeoHTMLSelectDone: function(request, response){
		this.registerGeoHTMLSelectHandler();
	},
	getGeoHTMLSelect: function(){
		geo_data = this.geo_data[this.geo_data_index];

		if (!geo_data) this.resetGeoDataIndex();

		pars = 'div_prefix=' + this.div_prefix;
		if (sel = this.getGeoHTMLSelectPointer(geo_data.name)){
			sel.options[0] = new Option(this.loading_text, '');
			sel.selectedIndex = 0;
		}
		// currently selected id
		// XXX - is it needed?!
		if (geo_data.id){
			pars += '&' + (geo_data.name == 'country' ? 'initial_' : '') + geo_data.name + '_id=' + geo_data.id;
		}
		// id of the entity select depends from
		if (this.geo_data[this.geo_data_index - 1]){
			pars += '&' + this.geo_data[this.geo_data_index - 1].name + '_id=' + this.geo_data[this.geo_data_index - 1].id;
		}
		new Ajax.Updater(
			this.div_prefix + '-' + geo_data.name + '-div',
			'/ajax/geo/geo_selects.html',
			{
				method: 'get',
				parameters: pars,
				onComplete: this.getGeoHTMLSelectDone.bind(this)
			});
	},
	getGeoHTMLSelectsDone: function(request, response){
		this.registerAllGeoHTMLSelectHandlers();
	},
	getGeoHTMLSelects: function(){
		Element.show_block(this.getGeoHTMLWrapperPointer());
	
		var pars = 'div_prefix=' + this.div_prefix + '&all_selects=1';
		var i = 0;
		var geo_data = null;
		while (geo_data = this.geo_data[i]){
			pars += (geo_data.id ? '&' + geo_data.name + '_id=' + geo_data.id : '');
			i++;
		}

		if (dgs = this.getGeoHTMLSelectsDivPointer()){
			Element.update(dgs, this.loading_text);
			new Ajax.Updater(
				dgs,
				AJAX_GEO_URL,
				{
					method: 'get',
					parameters: pars,
					onComplete: this.getGeoHTMLSelectsDone.bind(this)
				});
			try{
				new Draggable(this.getGeoHTMLWrapperPointer());
			}catch (e){}
		}
	},
	hideGeoHTML: function(){
		Element.hide(this.getGeoHTMLWrapperPointer());
	},
	addGeoHTMLTopSelectOption: function(text, is_default){
		var i = 0;
		var opt = geo_data = null;
		while (geo_data = this.geo_data[i]){
			if (!i) opt = new Option(text, is_default ? '' : geo_data.id);
			else opt.setAttribute('_' + geo_data.name + '_id', is_default ? '' : geo_data.id);
			i++;
		}
		//this.top_select_obj.options.push(opt); // not working...
		this.top_select_obj.options[this.top_select_obj.length] = opt;
	},
	changeTopSelect: function(e){
		if (!Field.present(Event.element(e))){
			this.fillGeoDataFromTopSelect();
			this.getGeoHTMLSelects();
		}else this.fillGeoDataFromTopSelect();
	},
	clickSaveBtn: function(e){
		var sel = sel_opt = geo_data = null;
		var i = 0;
		while (geo_data = this.geo_data[i]){
			if ((sel = this.getGeoHTMLSelectPointer(geo_data.name)) && (sel.length) && (!is_empty(sel.selectedIndex))){
				sel_opt = sel.options.item(sel.selectedIndex);
				geo_data.id = sel_opt.value;
				geo_data.text = sel_opt.innerHTML;
			}
			i++;
		}
		if (this.geo_data[0].text){
			new_opt_text = [];
			new_opt_text[0] = this.geo_data[0].text;
			if (this.geo_data[2].text || this.geo_data[1].text)
				new_opt_text[1] = this.geo_data[2].text || this.geo_data[1].text;
			new_opt_text = new_opt_text.join(', ');
			var i = 0;
			while (i < this.top_select_obj.length){
				if (new_opt_text == this.top_select_obj.options[i].innerHTML){
					this.top_select_obj.selectedIndex = i;
					break;
				}
				i++;
			}
			if (i == this.top_select_obj.length){
				this.top_select_obj.options[this.top_select_obj.length - 1] = null;
				this.addGeoHTMLTopSelectOption(new_opt_text);
				this.addGeoHTMLTopSelectOption(this.select_new_city_text, true);
				this.top_select_obj.selectedIndex = this.top_select_obj.length - 2;
			}
		}
		this.hideGeoHTML();
		this.fillGeoDataFromTopSelect();
	},
	clickCloseBtn: function(e){
		this.hideGeoHTML();
	},
	prepareGeoHTML: function(){
		this.addGeoHTMLTopSelectOption(this.select_new_city_text, true);
		this.fillGeoDataFromTopSelect();
		
		this.top_select_obj.onchange = this.changeTopSelect.bindAsEventListener(this);
		$(this.div_prefix + '-geo-btn-save').onclick = this.clickSaveBtn.bindAsEventListener(this);
		$(this.div_prefix + '-geo-btn-close').onclick = this.clickCloseBtn.bindAsEventListener(this);
	},
	fillGeoDataFromTopSelect: function(){
		var sel_opt = this.top_select_obj.options.item(this.top_select_obj.selectedIndex);
		var i = 0;
		var geo_data = null;
		while (geo_data = this.geo_data[i]){
			geo_data.id = $(this.div_prefix + '_' + geo_data.name + '_id').value = !i ? sel_opt.value : sel_opt.getAttribute('_' + geo_data.name + '_id');
			i++;
		}
	}
};