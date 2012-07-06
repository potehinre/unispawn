(function(undefined) {
	var SelectEmulator = Class.create();
	
	SelectEmulator.prototype = {
		
		/**
		 * Конструктор расширения
		 */
		initialize: function(elements) {
			elements.each(this.initWidget);
		},
		
		/**
		 * Конструктор виджета
		 */
		initWidget: function(context) {
			var
				$aElements = context.select('ul li a'),
				$ul = context.select('ul'),
				thisStyle = context.getAttribute('style'),
				thisClass = context.getAttribute('class'),
				thisId = context.getAttribute('id'),
				data = new Array();
			
			$ul[0].hide();
			// собираем информацию из ссылок
			$aElements.each(function(element, index) {
				data[index] = {
					text	: element.innerHTML,
					value	: element.getAttribute('value'),
					selected: element.getAttribute('selected'),
					location: element.getAttribute('href'),
					disabled: element.getAttribute('disabled')
				};
			});
			// убираем старый контейнер
			context.removeChild($ul[0]);
			
			var $select = context.getElementsByTagName('select')[0];
			
			if($select) {
				$select.setAttribute('style', thisStyle);
				$select.setAttribute('class', thisClass);
				$select.setAttribute('id', thisId);
				$select.removeClassName('select-emulator');

				// наполняем новый контейнер
				for(var key in data) {
					var 
						obj = data[key];
						if(typeof(obj) == 'object') {
							var	$option = document.createElement('option');

							$option.innerHTML		= obj.text;
							$option.setAttribute('value', obj.value);
							$option._location = obj.location;

							if(obj.selected) {
								$option.setAttribute('selected', 'selected')
							}

							if(obj.disabled) {
								$option.setAttribute('disabled', 'disabled')
							}

							$select.appendChild($option);
						}
				}

				// вставляем готовый селект перед контекстом
				context.parentNode
					.insertBefore(context.removeChild($select), context);

				// удаляем старый контекст
				context.parentNode.removeChild(context);

				$select.observe('change', SelectEmulator.changeLocation);
			}
		}
	};
	
	/**
	 * Осуществляет переход на новую страницу
	 * @static
	 */
	SelectEmulator.changeLocation = function(e) {
		top.location = e.target[e.target.selectedIndex]._location;
	}
	
	window.SelectEmulator = SelectEmulator;
})();

document.observe('dom:loaded', function(){
	new SelectEmulator($$('.select-emulator')); 
});