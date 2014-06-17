/**
 * Servercore
 * 
 * The core of the webserver, where it gets started controlled and managed
 * 
 * @author Hannes Eilers, Eike Petersen
 * @version 0.1
 */

var webSockets = require( process.cwd() + '/core/network/websockets.js' );
var udpConnection = require( process.cwd() + '/core/network/tcpnetwork.js' );

var logging = require( process.cwd() + '/core/logging/logging.js' );
var logger = logging.getLogger( 'core' );

var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.use( express.logger( 'dev' ) );
app.use(express.static(__dirname + '/public'));
server.listen( 11972 );

webSockets.attach( server );
udpConnection.createServer( 9090 );

webSockets.start( udpConnection );


