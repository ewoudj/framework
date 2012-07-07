var mongodb = require('mongodb');
var Db = mongodb.Db, ObjectID = mongodb.BSONPure.ObjectID, Server = mongodb.Server, path = require('path');

var storage = exports.Storage = function(host, port) {
	this.db = new Db('Framework', new Server(host, port, {
		auto_reconnect : true
	}, {}));
	this.db.open(function() {
	});
};

storage.prototype.idFromString = function(id) {
	if (id) {
		return ObjectID.createFromHexString(id);
	}
};

storage.prototype.getCollection = function(callback) {
	this.db.collection(/*'MyCollection'*/'second collection', function(error,
			collection) {
		if (error)
			callback(error);
		else
			callback(null, collection);
	});
};

storage.prototype.findAll = function(callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.find(function(error, cursor) {
				if (error)
					callback(error);
				else {
					cursor.toArray(function(error, results) {
						if (error)
							callback(error);
						else
							callback(null, results);
					});
				}
			});
		}
	});
};

storage.prototype.find = function(query, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.find(query, options, function(error, cursor) {
				if (error)
					callback(error);
				else {
					cursor.toArray(function(error, results) {
						if (error)
							callback(error);
						else
							callback(null, results);
					});
				}
			});
		}
	});
};

storage.prototype.count = function(query, callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.count(query, function(error, count) {
				if (error)
					callback(error);
				else {
					callback(null, count);
				}
			});
		}
	});
};

storage.prototype.findById = function(id, callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.findOne({
				_id : ObjectID.createFromHexString(id)
			}, function(error, result) {
				if (error)
					callback(error);
				else
					callback(null, result);
			});
		}
	});
};

storage.prototype.deleteById = function(id, callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.remove({
				_id : ObjectID.createFromHexString(id)
			}, function(error, result) {
				if (error)
					callback(error);
				else
					callback(null, result);
			});
		}
	});
};

storage.prototype.pathExists = function(p, callback) {
	fs.exists(p, function(exists) {
		callback(null, exists);
	});
};

/*storage.prototype.findEmps = function(callback) {
 this.getCollection(function(error, collection) {
 if( error ) callback(error)
 else {
 collection.find({firstName: 'Isaac'}, function(error, result) {
 if( error ) callback(error)
 else callback(null, result)
 });
 }
 });
 };

 storage.prototype.find = function(selector, fields, options, callback) {
 this.getCollection(function(error, collection) {
 if( error ) callback(error)
 else {
 collection.find(selector, fields, options, function(error, result) {
 if( error ) callback(error)
 else callback(null, result)
 });
 }
 });
 };
 */

storage.prototype.create = function(items, callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			if (typeof (items.length) == "undefined") {
				items = [ items ];
			}
			collection.insert(items, function() {
				callback(null, items);
			});
		}
	});
};

storage.prototype.update = function(selector, item, options, callback) {
	this.getCollection(function(error, collection) {
		if (error)
			callback(error);
		else {
			collection.update(selector, item, options, function() {
				callback(null, item);
			});
		}
	});
};

exports.Instance = new storage('localhost', 27017);