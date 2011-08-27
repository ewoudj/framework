/*
 * Usage: run with node.js
 * Demonstrates: Returns web page containing all existing friend objects in the store. 
 */
var http = require('http');
var page = require('./../controls/page').page;
var list = require('./../controls/list').list;
var model = require('./models/friendmodel').model;
var store = require('./../data/store').store;

http.createServer(function(req, res) {
	
	model.set({firstName: 'Jan', lastName: 'de Vries'});
	model.set({firstName: 'Klaas', lastName: 'de Jong'});
	
	
	
	var newPage = new page({
		title : 'List example',
		body : [ {
			controlType: 'list',
			title: 'Title of the list',
			items: [{title: 'First item'}, {title: 'Second item'}]
		} ]
	});
	var pageHtml = newPage.render();

	res.writeHead(200, {
		'Content-Type' : 'text/html'
	});
	res.end(pageHtml);

}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');

