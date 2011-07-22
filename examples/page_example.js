var http = require('http');
var control = require('./../controls/page').page;

http.createServer(function (req, res) {
	
  var page = new control({
	  title: 'Hello World!',
	  body: [{tag: 'h1', controlValue:'Hello World!'}]
  }); 
  var pageHtml = page.render();
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(pageHtml);
  
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');