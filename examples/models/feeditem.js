var model = require('./../..').model.model;

/*
 * The feed model describes all aspects a feed object
 * other runtime components can us this information to 
 * provide services.
 * Please note: The model is not a 'Class' but an instance of type model
 */
var feedItemModel = new model({
	name: 'feedItem',
	friendlyName: 'feedItem',
	submitTitle: 'Add',
	titleField: 'title',
	navigationTitle: 'FeedItems',
	navigatable: true,
	canUserNavigate: function(){return true;},
	permissions: {
		createRoles: ['*'], 		// Friends can be created by authenticated users
		readRoles: ['?'],			// Friends can be read by all users, also unauthenticated users  
		updateRoles: ['_owner'],	// Friend objects can only be modified by the original creator
		deleteRoles: ['_owner']		// Creators can delete their own feedItems		
	},
	fields:{
		title:{
			type: 'string',
			view: {
				title: 'Title',
				required: true,
    			special: {
	        		summary: {
	        			type: 'text',
	        			role: 'title'
	        		}
        		}
			}
		},
		feed:{
			type: 'string',
			view: {
				title: 'Feed',
				required: true,
    			special: {
	        		summary: {
	        			type: 'text',
	        			role: 'title'
	        		}
        		}
			}
		},
		body:{
			type: 'string',
			view: {
				title: 'Body',
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
				required: true,
    			special: {
	        		summary: {
	        			type: 'text',
	        			role: 'summary'
	        		}
        		}
			}
		}
	},
    methods: {
    	addItem : {
    		permissions: {
    			invokeRoles: ['*'] 			// Any role, but must be authenticated 
    		},
    		"function": function(config, callback){
    			var s = new store();
    			// Check if the user already has an opinion on this topic
    			s.get({query:{
    				_type: 'opinion',
    				_owner: config.session.user._id.toString(),
    				topic: this._id.toString()
    			}, session: config.session}, function(err, result){
    				// If the user already has an opinion on this topic it will
    				// it will be used as input for the form, else a new opinion 
    				// will be created
    				var input = result.total ? result.results[0] : registry['opinion'].create({
	    				topic: this._id
	    			}); 
    				callback( null, {
        				view: 'form',
    	    			mode: 'edit',
    	    			model: 'opinion',
    	    			value: input,
    	    			returnTo: {
    	    				view: 'form',
    	    				mode: 'view',
    	    				model: 'topic',
    	    				id: this._id
    	    			}
    				});
    			}.scope(this));
	    	}
    	}
    },
	set: function(options, callback){
		model.prototype.set.call(this, options, callback);
	}
});

exports = module.exports = {
	model : feedItemModel
};