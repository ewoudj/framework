/*
 * Store makes data access abstract
 */
var merge = require('./../controls/control').utils.merge;

var store = function(config){
	merge(this, config || {});
	this.clientCache = this.clientCache || {
		getById: {},
		get: {}
	};
};

//var httpRequest = function(options, callback){
//	req = new XMLHttpRequest();
//	req.open( "GET", url, true );
//	req.onreadystatechange = function () {
//	    if ( req.readyState === 4 && req.status === 200 ) {
//            var result = eval( req.responseText );
//            callback(null, result);
//        }
//	    else if(req.readyState === 4){
//	    	callback({message:'Error: server returned ' + req.status + ', response: ' + req.responseText}, null);
//	    }
//	};
//};

/*
 * Gets an object by ID 
 */
store.prototype.getById = function(id, callback){
	if(this.serverSide()){
		var storage = require('./../../private/data/storage').Instance;
		var me = this;
		storage.findById(id, function(err, result){
			me.clientCache.getById[id] = result;
			callback(err, result);
		});
	}
	else{
		callback(null, this.clientCache.getById[id]);
	}
};

store.prototype.get = function(options, callback){
	var jsonOptions = JSON.stringify(options);
	if(this.serverSide()){
		var me = this;
		var storage = require('./../../private/data/storage').Instance;
		var query = options.query;
		var options = {
			limit: options.limit || 25,
			skip: options.start || 0
		};
		storage.count(query, function(err, count){
			storage.find(query, options, function(err, queryResult){
				var result = {total: count, results: queryResult};
				me.clientCache.get[jsonOptions] = result;
				callback(null, result);
			});
		});
	}
	else{
		callback(null, this.clientCache.get[jsonOptions]);
	}
};

store.prototype.set = function(options, callback){
	if(this.serverSide()){
		var storage = require('./../../private/data/storage').Instance;
		storage.create(options.value, callback);
	}
	else{
		throw "Not implemented";
	}
};

store.prototype.remove = function(options, callback){
	
};

/*
 * Returns true if code is running on the server. (Checks to see if 'window' is defined, which is not the case on Node.js)
 */
store.prototype.serverSide = function(){
	return (typeof window === 'undefined');
};

store.fromControl = function(ctl){
	if(!ctl.store){
		if(ctl.rootControl){
			if(!ctl.rootControl.store){
				ctl.rootControl.store = new store();
			}
			ctl.store = ctl.rootControl.store;
		}
		else if(!ctl.rootControl && !ctl.isRootControl){
			throw 'Control has no root and is no root itself.';
		}
		else{
			ctl.store = new store();
		}
	}
	return ctl.store;
};

exports = module.exports = {
	store : store
};