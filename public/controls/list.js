var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;
var rest = require('./../net/rest').utils;
var model = require('./../data/model');
var store = require('./../data/store').store;
/*
 * List control
 * Input: {
 * 		items
 * 		title
 * 		query
 * 		value: {
 * 			query
 * 		},
 * 		rootControl
 * 		store,
 * 		model
 * }
 */
var list = function(config){
	merge(this,{
		tag: 'section',
		itemConfig: {
			controlType: 'listitem',
			view: 'summary'
		},
		attributes: {
			"class": 'list'
		}
	});
	merge(this, config);
	if(!this.items){
		this.items = [];
	}
	this.title = 'Search results';
	this.createTitleRow();
	if(!this.query && (config.value && config.value.query)){
		this.query = config.value.query;
	}
	control.call(this);
	if(!this.store){
		if(this.rootControl){
			if(!this.rootControl.store){
				this.rootControl.store = new store();
			}
			this.store = this.rootControl.store;
		}
		else{
			this.store = new store();
		}
	}
	if(this.store && this.query){
		this.busy(this);
		this.store.get({query: this.query, page: 0, limit: 25}, function (err, result){
			var data = result.results;
			for(var i = 0; i < data.length; i++){
				this.addItem(merge({controlValue: data[i]}, this.itemConfig));
			}
			this.done(this);
		}.scope(this));
	}
};

list.inheritsFrom(control);

list.prototype.createTitleRow = function(){
	if(this.title){
		if(typeof this.title !== 'string'){
			var friendlyName = this.model.friendlyName || this.model.name || 'object';
			if(this.mode === 'edit'){
				this.title = "Create " + friendlyName;
			}
			else if(this.mode === 'view'){
				this.title = capitalize(friendlyName) + ': ' + this.value[this.model.titleField];
			}
		}
		this.items.push({
			attributes: {"class":'formtitle'},
			controlValue: this.title
		});
	}
};

list.prototype.render = function(){
	var result = control.prototype.render.call(this);
	return result;
};

control.registry['list'] = list;
form.registerControl('view', 'referencelist', list, 'list');

// List item
var listItem = function(config){
	if(config && config.controlValue){
		this.itemData = config.controlValue;
		config.controlValue = null;
	}
	merge(this, config);
	var itemModel = model.registry[this.itemData._type];
	var view = itemModel.getSpecialView('summary', true);
	merge(this, {
		tag: 'div',
		items: [],
		attributes: {
			"class": 'listItem'
		},
		target: rest.toUrl({
			view: 'form',
			mode: 'view',
			model: this.itemData._type,
			id: this.itemData._id
		}),
		events: {
			onclick: function(ctl, evt){
				window.location.href = this.target;
			}
		}
	});
	for(var s in view){
		//if(view[s].role){
			var controlConfig = itemModel.getViewConfig(this.itemData, 'view', view[s], this.session);// createConfig(config);
			merge( controlConfig,{ attributes: {
				"class": view[s].role || ''
			}});
			this.items.push(controlConfig);
//			this.items.push({
//				controlValue: itemModel.getValue(this.itemData, s, this.session),
//				attributes: {
//					"class": view[s].role || ''
//				}
//			});
		//}
	}
	control.call(this);
};

listItem.inheritsFrom(control);

listItem.prototype.render = function(){
	var result = control.prototype.render.call(this);
	return result;
};

listItem.prototype.bind = function(rootElement){
	var result = control.prototype.bind.call(this,rootElement);
	return result;
};


control.registry['listitem'] = listItem;

// Module exports

exports = module.exports = {
	list : list,
	listItem: listItem
};