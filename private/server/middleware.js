var merge = require('./../../public/controls/control').utils.merge;
var application = require('./../../public/controls/application').application;
var model = require('./../../public/data/model');
var store = require('./../../public/data/store').store;
var user = require('./../../public/models/user');

var middleware = exports = module.exports = {
	config: {},
	/*
	 * Waits for upload of form to finish than continues
	 */
	waitForUploads: function(req, res, next){
		  if(!req.body && req.form){
			  req.form.complete(function(err, fields, files){
				 req.body = fields;
				 req.uploads = files;
				 next(); 
			  });
		  }
		  else{
			  next();
		  }
	},
	/*
	 * Handles client invocation of business logic.
	 * Typically modifies the request object to determine the resultant view.
	 */
	handleMethodInvocation: function(req, res, next){
		var config = req.query || {};
		var session = req.session;
		if(!config.invoke){ // The query does NOT have a invoke field so processing can continue as usual
			next();
		}
		else{
			// If the query contains an invoke field a method is invoked
			// which returns a new view definition. This view definition
			// is returned as the result for the callback function
			if(!config.model){ // Error: no model specified
				req.appError = 'No model was specified for the invocation';
				next();
			}
			// Get the requested model from the model registry
			var m = model.registry[config.model];
			if(!m){ // Error: The model does not exist in the registry
				req.appError = 'Model ' + config.model + ' was not found';
				next();
			}
			if(!(m.methods || m.methods[config.invoke])){ // Error: The method does not exist on the model
				req.appError = 'Model ' + config.model + ' does not have method ' + config.invoke;
				next();
			}
			// Check to see if the current user can invoke the method
			if(!m.canInvoke(m.methods[config.invoke], session)){
				if(!session.user){ // No user is signed in: redirect to login page
					req.query = merge({returnTo: config}, user.loginView);
					next();
				}
				else{ // Error: The signed in user is not allowed to invoke: show message
					req.appError = 'The current user does not have sufficient priviliges to perform the selected action';
					next();
				}
			}
			// The method is defined on the model and the current user should be able to invoke
			var actualFunction = m.methods[config.invoke]["function"];
			if(config.id){
				// If an id is provided with the invoke the method 
				// will be called bound to that instance
				var s = new store();
				s.getById(config.id, function(err, result){
					if(result){ 
						// An object is found with that ID, the method will 
						// now be called in the scope of that object
						actualFunction.scope(result)({query: config, session: session}, function(err, newView){
							req.query = newView;
							next();
						});
					}
					else{ // Error: The object was not found
						req.appError = 'Object with id ' + config.id + ' was not found';
						next();
					}
				});
			}
			else{  // If no id is provided the method is called bound to the model (assumed static)
				actualFunction.scope(m)({query: config, session: session}, function(err, newView){
					req.query = newView;
					next();
				});
			}
		}
	},
	/*
	 * Handles the post of form data by invoking the relevant model's persistence logic.
	 * Typically the model modifies the view.
	 */
	handleFormPost: function(req, res, next){
		if(req.method === 'POST'){
			model.registry[req.body._type].set({value: req.body, session: req.session}, function(err, setResult){
				if(setResult && setResult.issues){
					req.query = setResult;
				}
				else{
					// If no specific returnTo has been specified for the post
					// by default the entity just posted is shown in read only mode.
					if(Object.keys(req.query).length === 0 && setResult && setResult.length > 0){
						// Hmm maybe we should not modify the req object
						req.query = {
							view: 'form',
							mode: 'view',
							model: setResult[0]._type,
							id: setResult[0]._id.toString()
						};
					}
				}
				next();
			});
		}
		else{
			next();
		}
	},
	/*
	 * Renders the actual application.
	 * Typically this method is at the bottom (executed last) of the middleware stack.
	 */
	renderApplication: function(req, res, next){
		var app = new application(req.query, req.session);
		var applicationClass = "/index.js";
		app.ready(function() {
			req.query.models = middleware.config.models;
			var clientConfig = JSON.stringify(req.query);
			var clientData = JSON.stringify(app.store.clientCache);
			var sessionData = JSON.stringify({user: req.session ? req.session.user : null});
			var s =     "function boot(){\n";
			var s = s + "    var framework = require('/index.js');\n";
			var s = s + "    require.modules['frameworkjs'] = function(){ return framework; }\n";
			var s = s + "    var app = framework.application;\n";
			var s = s + "    var config = " + clientConfig + ";\n";
			var s = s + "    if(config.models){\n";
			var s = s + "        for(var i = 0; i < config.models.length; i++){\n";
			var s = s + "            var m = config.models[i];\n";
			var s = s + "            m = m.substring(m.lastIndexOf('/'));\n";
			var s = s + "            require(m);\n";
			var s = s + "        }\n";
			var s = s + "    }\n";
			var s = s + "    ";
			var s = s + "    var application = new app( config, " + sessionData + " ," + clientData + ");\n";
			var s = s + "    application.bind(document.childNodes[0]);\n";
			var s = s + "}";
			app.head.bootScript.controlValue = s;
			var html = app.render();
			res.writeHead(200, {
				'Content-Length': html.length,
				'Content-Type': 'text/html' 
			});
			res.end(html);
			//next();
		});
	}
};