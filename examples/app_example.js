/*
 * Example application
 * 
 * Start using node server.js --app:examples/app_example.js
 */

var framework = require('./..');
var application = framework.application;

var sampleApp = function(config, session, clientData){
	application.call(this, config, session, clientData);
};

sampleApp.inheritsFrom(application);

exports = module.exports = {
	application : sampleApp
};

