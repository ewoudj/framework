/*
 * The friend model describes all aspects a friend object
 * other runtime components can us this information to 
 * provide services.
 * Please note: The model is not a 'Class' but an instance of type model
 */
var friendModel = new model({
	name: 'friend',
	friendlyName: 'friend',
	submitTitle: 'Add',
	permissions: {
		createRoles: ['*'], 		// Friends can be created by authenticated users
		readRoles: ['?'],			// Friends can be read by all users, also unauthenticated users  
		updateRoles: ['_owner'],	// Friend objects can only be modified by the original creator
		deleteRoles: ['_owner']		// Creators can delete their own friends		
	},
	fields:{
		firstName:{
			type: 'string',
			view: {
				title: 'First name',
				required: true
			}
		},
		lastName:{
			type: 'string',
			view: {
				title: 'Last name',
				required: true
			}
		},
		email:{
			type: 'string',
			view: {
				title: 'E-mail',
				required: false
			}
		}
	},
	set: function(options, callback){
		model.prototype.set.call(this, options, callback);
	}
});

exports = module.exports = {
	model : friendModel
};