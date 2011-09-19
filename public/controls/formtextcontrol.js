var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;

/*
 * Text control
 */
var textControl = function(config){
	config = config || {};
	this.parentControl = config.parentControl;
	if(config.mode === 'view'){
		merge( this, {
			controlValue: config.value || '',
			attributes: config.attributes || {
				"class": 'valueview'
			}
		});;
	}
	else if (config.mode === 'edit'){
		merge(this, {
			tag: 'input',
			attributes: {
				type: config.field.type || 'text',
				name: config.field.name,
				value: config.value || '',
				placeholder: config.field.description || '',
				autocomplete: config.field.autoComplete ? 'on' : 'off'
			}
		});
	}
	control.call(this);
};
textControl.inheritsFrom(control);

control.registry['textControl'] = textControl;

form.registerControl('view', 'text', textControl, 'textControl');
form.registerControl('edit', 'text', textControl, 'textControl');
form.registerControl('summary', 'text', textControl, 'textControl');
form.registerControl('summary', 'title', textControl, 'textControl');

form.registerControl('view', 'hidden', textControl, 'textControl');
form.registerControl('edit', 'hidden', textControl, 'textControl');
form.registerControl('summary', 'hidden', textControl, 'textControl');

form.registerControl('edit', 'password', textControl, 'textControl');

form.registerControl('summary', 'memo', textControl, 'textControl');

exports = module.exports = {
	control: textControl
};