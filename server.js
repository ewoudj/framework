var connect = require('connect');
var form = require('connect-form');
var framework = require('./');
var application = require('./application').application;
var argv = require('optimist').argv;

if(argv.app){
	application.current = require(argv.app).application;
}

debugger;
var middleware = {
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
			model.registry[data._type].set({value: data, session: session}, function(err, setResult){
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
			var clientConfig = JSON.stringify(req.query);
			var clientData = JSON.stringify(app.store.clientCache);
			var sessionData = JSON.stringify({user: req.session ? req.session.user : null});
			var script = "function boot(){\nvar app = new (require('" + applicationClass + "').application)(";
			script = script + clientConfig + ", " + sessionData + " ," + clientData + ");\napp.bind(document.childNodes[0]);\n}";
			app.head.bootScript.controlValue = script;
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

connect(
	form({ keepExtensions: true })
  , connect.static(__dirname + '/static', { maxAge: 0 })	
  , require( 'browserify' )({
	  ignore : [__dirname + '/private/data/storage.js', 'mongodb', 'crypto', 'md5'],
	  require : __dirname + '/index.js',
	  mount : '/script.js'
  })
  , connect.query()
  , connect.cookieParser()
  , connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }})
  , connect.favicon()
//  , connect.csrf() // Causes form submits to fail ('forbidden')
  , middleware.waitForUploads
  , middleware.handleMethodInvocation
  , middleware.handleFormPost
  , middleware.renderApplication
).listen(3001);
console.log('Application listening at 3001');