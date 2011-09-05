var connect = require('connect');
var form = require('connect-form');
var browserify = require( 'browserify' );
var middleware = require('./middleware');
var framework = require('./../..');

exports = module.exports = {
	createServer : function(port, models){
		var result = connect(
			form({ keepExtensions: true }),
			connect.static(__dirname + '/../../static', { maxAge: 0 }), 
//			browserify({
//				ignore : [
//	                __dirname + '/../../private/data/storage.js',
//	                __dirname + '/../../private/server/http.js',
//	                __dirname + '/../../private/server/middleware.js',
//	                'mongodb', 'crypto', 'md5'],
//				require : __dirname + '/../../index.js',
//				mount : '/script.js'
//			}),
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