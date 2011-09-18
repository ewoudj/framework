var model = require('./../..').model.model;

/*
 * The feed model describes all aspects a feed object
 * other runtime components can us this information to 
 * provide services.
 * Please note: The model is not a 'Class' but an instance of type model
 */
var feedModel = new model({
	name: 'feed',
	friendlyName: 'feed',
	submitTitle: 'Add',
	titleField: 'title',
	navigationTitle: 'Feeds',
	navigatable: true,
	canUserNavigate: function(){return true;},
	permissions: {
		createRoles: ['*'], 		// Friends can be created by authenticated users
		readRoles: ['?'],			// Friends can be read by all users, also unauthenticated users  
		updateRoles: ['_owner'],	// Friend objects can only be modified by the original creator
		deleteRoles: ['_owner']		// Creators can delete their own feeds		
	},
	fields:{
		title:{
			type: 'string',
			view: {
				title: 'Title',
				required: true
			}
		},
		description:{
			type: 'string',
			view: {
				title: 'Description',
				type: 'memo',
				required: true,
    			special: {
    				view: {
    					type: 'text'
    				},
	        		summary: {
	        			type: 'text',
	        			role: 'summary'
	        		}
        		}
			}
		},
		url:{
			type: 'string',
			view: {
				title: 'URL',
				required: false
			}
		}
	},
	set: function(options, callback){
		model.prototype.set.call(this, options, callback);
	}
});

exports = module.exports = {
	model : feedModel
};