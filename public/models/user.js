var model = require('./../data/model').model;
var guid = require('./../data/model').guid;
var rest = require('./../net/rest').utils;
var store = require('./../data/store').store;

var userModel = new model({
	name: 'user',
	friendlyName: 'user',
	titleField: 'userName',
	submitTitle: 'Submit',
	permissions: {
		createRoles: ['?'], 					// Everybody can create an account
		readRoles: ['?'],
		updateRoles: ['_owner'],
		deleteRoles: []
	},
	fields:{
		userName:{
			type: 'string',
			view: {
				title: 'Username',
				required: true,
				special: {
					summary: {
	        			type: 'text'
					}
				}
			}
		},
		password:{
			type: 'string',
			view: {
				unavailable: true,
				special: {
					edit: {
						unavailable: false,
						title: 'Password',
						type: 'password',
						required: true
					}
				}
			}
		},
		passwordRepeat:{
			type: 'string',
			view: {
				unavailable: true,
				special: {
					edit: {
						unavailable: false,
						title: 'Repeat',
						type: 'password',
						description: 'Repeat the password',
						required: true
					}
				}
			}
		},
		email:{
			type: 'string',
			view: {
				title: 'E-mail',
				required: true
			}
		}
	},
	set: function(options, callback){
		options.value.salt = guid();
		options.value.password = md5(options.value.password + options.value.salt);
		model.prototype.set.call(this, options, callback);
	}
});

var md5 = function(s) {
	var crypto = require('crypto');
	return crypto.createHash('md5').update(s).digest('hex');
};

var loginModel = new model({
	name: 'login',
	friendlyName: 'login',
	submitTitle: 'Sign in',
	permissions: {
		createRoles: ['?'], 					// Everybody can login
		readRoles: [],
		updateRoles: [],
		deleteRoles: []
	},
	fields:{
		userName:{
			type: 'string',
			view: {
				title: 'Username',
				required: true,
				autoComplete: true
			}
		},
		password:{
			type: 'string',
			view: {
				type: 'password',
				title: 'Password',
				required: true,
				autoComplete: true
			}
		}		
	},
	references : {
		requestAccount: {
			title: 'Create Account',
			url: rest.toUrl({
				view: 'form',
				mode: 'edit',
				model: 'user'
			})
		},
		requestPassword: {
			title: 'Request new password',
			url: 'http://www.somewhere.com'
		}
	},
	set: function(options, callback){
		var db = new store();
		db.get({query: {_type:'user', userName: options.value.userName}}, function(err, result){
			var issue = '';
			var users = result.results;
			if(users.length > 0){
				var u = users[0];
				if(u.password == md5(options.value.password + u.salt)){
					options.session.regenerate(function(){
						options.session.req.session.user = u;
						callback(null);						
					});
					return;
				}
				else{
					issue = 'Invalid username password pair.';
				}
			}
			else{
				issue = 'Username not found.';
			}
			callback({error: issue},null);
		});
	}
});

exports = module.exports = {
	model : userModel,
	loginModel: loginModel,
	loginView: {
		controlType: 'form',
		mode: 'edit',
		view: 'form',
		title: 'Sign in',
		model: 'login',
		value: null
	}
};