(function() {
'use strict';

var express = require('express');

var app = express();


// Warning: if you want to use custom port, don't forget to mention that in urls.js (registry module) file

var webServerPort = +process.argv[2] || 8080;

var appResourcesFolder = '';


app.set('port', webServerPort);

app.use(express.static(__dirname + appResourcesFolder));

// Launch web server

var webServer = app.listen(webServerPort, function() {
  console.log('Local web server is up and running at port: ', webServerPort);
});
})();

