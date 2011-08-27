var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;

/*
 * Radio control
 */
var radioControl = function(config){
	if (config.mode === 'edit'){
		var optionItems = [];
		if(config.field.options){
			config.field.options.forEach(function(option){
				optionItems.push({
					tag: 'label',
					controlValue: option.title,
					items: [{
						tag: 'input',
						attributes: {
							name: config.field.name,
							type: 'radio',
							value: option.value,
							// This needs to be === check why config.value is a string
							checked: (option.value == config.value) ? 'checked' : ''
						}
					}]
				});
			});
		}
		merge(this, {
			tag: 'fieldset',
			items: optionItems
		});
	}
	control.call(this, config);
};
radioControl.inheritsFrom(control);

control.registry['radioControl'] = radioControl;

form.registerControl('edit', 'radio', radioControl, 'radioControl');

exports = module.exports = {
	control: radioControl
};