/**
 * Servercore
 * 
 * The core of the webserver, where it gets started controlled and managed
 * 
 * @author Hannes Eilers, Eike Petersen
 * @version 0.1
 */

var webSockets = require( process.cwd() + '/core/network/websockets.js' );
var tcpConnection = require( process.cwd() + '/core/network/tcpnetwork.js' );

var logging = require( process.cwd() + '/core/logging/logging.js' );
var logger = logging.getLogger( 'core' );

var express = require('express');
var https = require('https');
var http = require('http');
fs = require("fs");

var app = express();

var privateKey  = fs.readFileSync(process.cwd() + '/core/server.key', 'utf8');
var certificate = fs.readFileSync(process.cwd() + '/core/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var httpsserver = https.createServer(credentials, app);
var server = http.createServer(app);

app.use( express.logger( 'dev' ) );
app.use(express.static( process.cwd() + '/public'));
httpsserver.listen( 11972 );
server.listen( 11973 );

webSockets.attach( server );
tcpConnection.createServer( 9090 );

webSockets.start( tcpConnection );


