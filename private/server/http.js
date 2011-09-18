var connect = require('connect');
var form = require('connect-form');
var browserify = require( 'browserify' );
var middleware = require('./middleware');
var framework = require('./../..');

exports = module.exports = {
	createServer : function(port, config){
		var requires = [__dirname + '/../../index.js'];
		if(!config){
			config = {};
		}
		// The available models are typically specified by the application using the framework.
		// The defening application send the list of models in the config for the createServer function.
		if(config.models){
			for(var i = 0; i < config.models.length; i++){
				// Add to the requires list: this makes the model available on the client
				requires.push(config.models[i]);
				// Require the model: this makes the model register with the model registry
				require(arguments.callee.caller.arguments[4] /*__dirname from caller*/ + config.models[i].substring(1));
			}
		}
		middleware.config = config;
		var result = connect(
			form({ keepExtensions: true }),
			connect.static(__dirname + '/../../static', { maxAge: 0 }), 
			browserify({
				ignore : [
	                './private/data/storage',
	                './private/server/http',
	                './private/server/middleware',
	                'mongodb', 'crypto', 'md5'],
				require : requires,
				mount : '/script.js'
			}),
			connect.query(), 
			connect.cookieParser(),
			connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}),
			connect.favicon(),
			middleware.waitForUploads,
			middleware.handleMethodInvocation,
			middleware.handleFormPost,
			middleware.renderApplication
		).listen(port);
		console.log('Application listening at ' + port);
		return result;
	}
};