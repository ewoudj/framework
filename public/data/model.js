var merge = require('./../controls/control').utils.merge;
var store = require('./../data/store').store;
var async = require('async');

var registry = {};

var model = function(config){
	if(config){
		merge(this, config);
	}
	this.store = this.store || new store();
	if(!this.fields){
		this.fields = {};
	}
	if(!this.methods){
		this.methods = {};
	}
	this.fields._type = {
    	type: 'string',
    	view: {type:'hidden'}
	};
	for(var s in this.fields){
		this.fields[s].name = s;
	}
	for(var s in this.methods){
		this.methods[s].name = s;
	}
	registry[this.name] = this;
};

model.prototype.getValue = function(instance, fieldName, session){
	var result = null;
	if(this.fields[fieldName].type === 'dynamic'){
		result = (this.fields[fieldName].method.scope(instance))(session);
	}
	else{
		result = instance[fieldName];
	}
	return result;
};

model.prototype.getViewConfig = function(instance, mode, field, session){
	var formRegistry = require('./../controls/form').form.registry;
	var result = null;
	var viewType = field.type || 'text';
	if(formRegistry && formRegistry[mode] && formRegistry[mode][viewType]){
		result = {};
		merge(result, {
			field: field, 
			mode: mode, 
			value: this.getValue(instance, field.name, session)
		});
		result.controlType = formRegistry[mode][viewType].name;
	}
	else {
		debugger;
		throw 'Error: requested form mode / type combination is not registered';
	}
	return result;
};

model.prototype.create = function(config){
	var result = {};
	if(config){
		merge(result, config);
	}
	for(var s in this.fields){
		if(!result[s]){
			result[s] = null;
		}
	}
	result._type = this.name;
	return result;
};

model.prototype.can = function(permissionName, session, permissionSet){
	var result = false;
	var permissions = permissionSet || this.permissions;
	if(permissions){
		if(permissions[permissionName + 'Roles']){
			permissions[permissionName + 'Roles'].forEach(function(role){
				if((role === '?') || 
						(role === '*' && session.user) ||
						(session.user && session.user.roles && session.user.roles.indexOf(role) > -1)){
					result = true;
				}
			}); 
		}
	}
	else{
		result = true; // No permission defined, everything is allowed
	}
	return result;
};

model.prototype.canCreate = function(session){
	return this.can('create', session);
};

model.prototype.canRead = function(session){
	return this.can('read', session);
};

model.prototype.canUpdate = function(session){
	return this.can('update', session);
};

model.prototype.canDelete = function(session){
	return this.can('delete', session);
};

model.validationRules = {
	length: function (callback){
		var min = this.options.min || 0;
		var max = this.options.max || 0;
		var issues = [];
		if(min){
			if(!this.value || this.value.length < 0){
				issues.push('Too short: the input must consist of at least ' + min + ( (min === 1) ? ' character.' : ' characters.'));
			}
		}
		if(max && this.value){
			if(this.value.lenght > max){
				issues.push('Too long: the input can consist of at most ' + max + ( (max === 1) ? ' character.' : ' characters.'));
			}
		}
		callback(null, {issues: issues, field: this.field});
	},
	/*
	 * The uniqueness validation rule checks if a provided value
	 * is unique in the provided options.store for the provided
	 * fields in options.fields.
	 * Returns an issue in the result.issue in callback(err, result)
	 */
	uniqueness: function(callback){
		if(!this.options.store){
			throw 'Uniqueness validation rule requires options.store to be set.';
		}
		if(!this.options.fields || !this.options.fields.length){
			throw 'Uniqueness validation rule requires at least one field name to be provided in options.field.';
		}
		// Construct the query to test for uniqueness
		var query = {};
		for(var i = 0; i < this.options.fields.length; i++){
			query[this.options.fields[i]] = this.value[this.options.fields[i]];
		}	
		this.store.get({query: query, page: 0, limit: 2}, function (err, result){
			var data = result.results;
			var issues = [];
			if((data.length === 0)// If there are no results we are always OK
					// Or if there is only one result and the id is the same as 
					// that of the object being validate we are also OK
				|| (data.length === 1 && data[0]._id.toString() === this.value._id.toString()) ) {
				// All other cases: the object is not unique
				issues.push('The object does not meet the required uniqueness criteria.');
			}	
		});
		callback(null, {issues: issues});
	}
};

model.prototype.canInvoke = function(method, session){
	var result = false;
	if(method){
		if(method.permissions){ // Check permissions
			result = this.can('invoke', session, method.permissions);
		}
		else{ // No permissions defined on the method: the user can always invoke
			result = true;
		}
	}
	return result;
};

model.prototype.validate = function(value, callback){
	var validationTasks = [];
	// Validate individual fields
	for(var s in this.fields){
		var field = this.fields[s];
		if(field.validation){
			for(var j = 0; j < field.validation.length; j++){
				var validationRule = field.validation[j];
				validationTasks.push(model.validationRules[validationRule.rule].scope({
					field: field,
					value: value[s],
					options: validationRule
				}));
			}
		}
	}
	// Validate overall object
	// Execute all validation Task in parallel
	async.parallel( validationTasks, function(err, results){
		var issues = false;
		for(var i = 0; i < results.length; i++){
			if(results[i].issues && results[i].issues.length > 0){
				issues = true;
				break;
			}
		}
		callback(null, {
			issues: issues,
			validationTasks: validationTasks,
			validationResults: results
		});
	});
};

model.prototype.set = function(options, callback){
	// If no id exists on the value creation is assumed,
	// at this time the current user is made the owner 
	// of this object. The owner might be needed for object validation
	if(!options.value._id){
		if(options.session.user){
			options.value._owner = options.session.user._id;
		}
	}
	this.validate(options.value, function(err, validationResult){
		// If validation resulted in issues, show them to the user
		// and return to the object in edit mode
		if(validationResult.issues){
			callback(null, {
				view: 'form',
				mode: 'edit',
				model: this,
				value: options.value,
				issues: validationResult
			});
		}
		// Else persist the object
		else{
			if(
				(options.value._id && this.canUpdate(options.session)) ||
				(!options.value._id && this.canCreate(options.session))
			){
				if(!options.value._id){
					options.value._created = new Date();
					options.value._changed = options.value._created;
				}
				else{
					options.value._changed = new Date();
				}
				this.store.set(options, callback);
			}
			else {
				throw 'The user is not allowed to create this object and should have never gotten this far.';
			}
		}
	}.scope(this));
};

/*
 * Returns a flattened view structure for the given special view name. 
 * If exclusive is set to true only fields are return that specify the special view.
 * The idea is that special views modify the 'default view'
 */
model.prototype.getSpecialView = function(specialViewName, exclusive){
	if(!this.specialViewCache){
		this.specialViewCache = {};
	}
	if(!this.specialViewCache[specialViewName]){
		var newView = {};
		if(this.fields){
			for(var s in this.fields){
				var field = this.fields[s];
				if(field.view && 
						(!exclusive || 
								(field.view.special && field.view.special[specialViewName] && !field.view.special[specialViewName].unavailable))){
					newView[field.name] = {};
					newView[field.name].name = s;
					merge(newView[field.name], field.view);
					if(field.view.special && field.view.special[specialViewName]){
						merge(newView[field.name], field.view.special[specialViewName]);
					}
				}
			};
		}
		this.specialViewCache[specialViewName] = newView;
	}
	return this.specialViewCache[specialViewName];
};

exports = module.exports = {
	model: model,
	registry: registry,
	/*
	 * Return model
	 * if input is string the related model is retrieved from the registry
	 * if the input is a model, the model is returned
	 * if the input is an object with a ._type property, that value is used to get the model from the registry
	 */
	getModel: function(o){
		var result = null;
		if(o){
			if(typeof o === 'string'){
				result = registry[o];
			}
			else if( Object.getPrototypeOf(o).constructor === model.prototype.constructor){
				result = o;
			}
			else if(o._type){
				result = registry[o._type];
			}
		}
		return result;
	},
	guid: function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	} 
};
