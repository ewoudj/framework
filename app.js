// Example server

var server = require('./private/server/http').createServer(3001, {
    models :[
         "./examples/models/feed.js",
         "./examples/models/feeditem.js"
     ]
 });