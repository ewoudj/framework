var control = require('./control').control;
var merge = require('./control').utils.merge;
var utils = require('./control').utils;
var model = require('./../data/model');
var store = require('./../data/store').store;
var restConfig = require('./../net/rest').configuration;
var rest = require('./../net/rest').utils;

var form = function(config){
	var postUrl = restConfig.baseUrl;
	if(config.returnTo){
		postUrl = rest.toUrl(config.returnTo);
	}
	merge(this,{
		tag: 'form',
		items: [],
		mode: 'view',
		attributes: {
			action: postUrl,
			method: 'post'
		}
	});
	merge(this, config);
	control.call(this);	
	store.fromControl(this);
	// If the model is not set, try to see if we can deduce it from 
	// the value.
	if(!this.model && this.value && this.value._type){
		this.model = this.value._type;
	}
	if(!this.model) {
		throw 'Unable to determine the model for the form view. Please provide a model or a value';
	}
	if(typeof this.model === 'string'){
		this.model = model.registry[this.model];
	}
	if(this.value){
		if(typeof this.value === 'string'){
			// Assume the value is an id
			this.busy(this);
			this.store.getById(this.value, function (err, result){
				this.value = result;
				this.initializeForm();			
				this.done(this);
			}.scope(this));
			return;
		}
	}
	else {
		this.value = this.model.create();
	}
	this.initializeForm();
};
form.inheritsFrom(control);

form.prototype.initializeForm = function(){
	this.createTitleRow();
	if(this.issues){
		
		this.addItem({
			items: [{
				tag: 'p',
				controlValue: 'Your request could not be completed, please correct the following issues:',
				attributes: { "class": 'title'}
			}, {
				tag: ul,
				items: validationItems
			}],
			attributes: {
				"class": 'formIssuesPanel'
			}
		});
	}
	this.addFormFields();
	if(this.mode === 'edit'){
		this.addEditButtons();
	}
	this.addReferences();
};

form.prototype.addFormFields = function(){
	var i = 0;
	this.viewFields = this.model.getSpecialView(this.mode);
	for(var s in this.viewFields){
		if(!this.viewFields[s].unavailable){
			this.addItem(createRow({
				field: this.viewFields[s], 
				value: this.value, 
				first: i === 0,
				mode: this.mode,
				session: this.session,
				model: this.model
			}));
		}
		i++;
	}
};

form.prototype.addEditButtons = function(){
	this.addItem( createRow({
		controlItems: [{
			tag: 'input',
			attributes: {
				type: 'submit',
				value: this.model.submitTitle || 'Submit',
				"class": 'button blue'
			}
		}, {
			tag: 'button',
			controlValue: 'Cancel',
			attributes: {
				"class": 'button red'
			}
		}]}
	));
};

form.prototype.addReferences = function(){
	if(this.model && this.model.references){
		for(var s in this.model.references){
			var reference = this.model.references[s];
			this.addItem(createRow({
				controlItems: [{
					tag: 'a',
					controlValue: reference.title,
					attributes:{
						'href': reference.url,
						"class": 'referencelink'
					}
				}]
			}));
		};
	}
};

/*
 * Utility function that creates a title for the form
 * 
 * Remarks: 
 * - This function is exported and used by other controls (e.g. list).
 * - This function needs to be bound to a control with a title field and an items array
 */
var createTitleRow = form.prototype.createTitleRow = function(){
	if(this.title){
		if(typeof this.title !== 'string'){
			var friendlyName = this.model ? (this.model.friendlyName || this.model.name) : 'object';
			if(this.mode === 'edit'){
				this.title = "Create " + friendlyName;
			}
			else if(this.mode === 'view'){
				this.title = capitalize(friendlyName) + ': ' + this.value[this.model.titleField];
			}
		}
		this.addItem({
			attributes: {"class":'formtitle'},
			controlValue: this.title
		});
	}
};

var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/*
 * Private utility function that creates form rows
 */
var createRow = function(config){
	var labelConfig, controlConfig;
	var rowClass = 'formrow';
	var items = [];
	if(config.field){
		labelConfig = {
			tag: 'label',
			attributes: {
				"for": config.field.name,
				name: config.field.name
			},
			controlValue: config.field.title + ":"
		};
		controlConfig = config.model.getViewConfig(config.value, config.mode, config.field, config.session);// createConfig(config);
		if(config.field.type === 'hidden'){
			rowClass = rowClass + ' hidden';
		}
		items.push(labelConfig);
		items.push(controlConfig);
	}
	else{
		// Label is just used as place holder
		labelConfig = {
			tag: 'label'
		};
		items.push(labelConfig);
		for(var i = 0; i < config.controlItems.length; i++){
			items.push(config.controlItems[i]);
		}
	}
	var finalClass = rowClass;
	if(config.first){
		finalClass = finalClass + ' first';
	}
	if(config.last){
		finalClass = finalClass + ' last';
	}
	if(config.field && config.field.hideLabel){
		finalClass = finalClass + ' hidelabel';
	}
	if(controlConfig && controlConfig.parentClass){
		finalClass = finalClass + ' ' + controlConfig.parentClass;
	}
	return {
		field: config.field,
		// parentControl: config.parentControl,
		attributes: {
			"class": finalClass
		},
		items: items
	};	
};
control.registry['form'] = form;

/*
 * Registers a control for use in forms.
 * In model view row descriptions the config.mode and config.type
 * are used to resolve the actual control used.
 * The control should reference the actual control 
 * The controlName should be the control.registry name for the control  
 */
form.registerControl = function(mode, type, control, controlName){
	if(!(mode && type && control && controlName)){
		throw 'All arguments are mandatory for this function';
	}
	if(!form.registry){
		form.registry = {};
	}
	if(!form.registry[mode]){
		form.registry[mode] = {};
	}
	form.registry[mode][type] = {
		control: control,
		name: controlName	
	};
};

form.getControl = function(mode, type){
	var result = null;
	if(form.registry && form.registry[mode] && form.registry[mode][type]){
		result = form.registry[mode][type].control;
	}
	return result;
};

/*
 * Return the configuration for a control for the given mode
 * and type.
 * The result is a new object with the input config merged and
 * the controlType set to the controlName used with form.registerControl
 * config: {field: fieldValue, mode: modeValue, value: valueForTheControl}
 */
var createConfig = function(config){
	var result = null;
	var viewType = config.field.type || 'text';
	if(form.registry && form.registry[config.mode] && form.registry[config.mode][viewType]){
		result = {};
		merge(result, config);
		result.controlType = form.registry[config.mode][viewType].name;
	}
	else {
		debugger;
		throw 'Error: requested form mode / type combination is not registered';
	}
	return result;
};

var createControl = function(config){
	var controlType = form.getControl(config.mode, config.field.type || 'text');
	var result = new controlType(config);
	return result;
};

exports = module.exports = {
	form: form,
	utils: {
		createTitleRow: createTitleRow
	}
};