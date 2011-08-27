var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;

/*
 * Memo control
 */
var memoControl = function(config){
	if (config.mode === 'edit'){
		merge(this, {
			tag: 'textarea',
			controlValue: config.value || '',
			attributes: {
				name: config.field.name,
				placeholder: config.field.description || ''
			}
		});
	}
	control.call(this, config);
};
memoControl.inheritsFrom(control);

control.registry['memoControl'] = memoControl;

form.registerControl('edit', 'memo', memoControl, 'memoControl');

exports = module.exports = {
	control: memoControl
};