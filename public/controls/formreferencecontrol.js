var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;
var rest = require('./../net/rest').utils;

/*
 * Form Reference control
 */
var referenceControl = function(config){
	merge(this, {
		tag: 'div',
		parentClass: 'reference',
		attributes:{
			"class": config.field.role || 'button' 
		},
		controlValue: config.field.title || 'Username'
		
	});
	this.parentControl = config.parentControl;
	this.jsLink = this.parentIsA(this.parentControl);
	this.target = rest.toUrl(config.value);
	if(!this.jsLink){
		this.tag = 'a';
		this.attributes.href = this.target;
	}
	else{
		this.events = {
			onclick: function(ctl, evt){
				window.location.href = this.target;
			}
		};
	}
	control.call(this);
};
referenceControl.inheritsFrom(control);

/*
 * This function prevents A elements within A elements
 * The inner a element is now rendered as a div and a 
 * client side link should be created at bind time
 */
referenceControl.prototype.parentIsA = function(parentControl){
	var result = false;
	if(parentControl.tag === 'a'){
		result = true;
	}
	else if (parentControl.parentControl){
		result = this.parentIsA(parentControl.parentControl);
	}
	return result;
};

control.registry['referenceControl'] = referenceControl;

form.registerControl('view', 'reference', referenceControl, 'referenceControl');
form.registerControl('summary', 'reference', referenceControl, 'referenceControl');

exports = module.exports = {
	control: referenceControl
};