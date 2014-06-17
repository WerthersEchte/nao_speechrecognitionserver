/**
 * New node file
 */

var log4js = require('log4js');
var logger = log4js.getLogger();

var wsio = require('ws').Server;

module.exports = (function(){
	
	var that = {};
	
	var ws = null;
	var _naoConnection = null;
	
	that.attach = function( webserver ){
		
		ws = new wsio({server: webserver });
		
	};
	
	var newClient = function( socket ) {
		
		if( socket ){

			socket.on('error', function ( error ) {
				
				logger.error('Error in websocket: ' + error);
				socket.close();
				
			});

			socket.on('message', function ( message ) {
				logger.debug( message );
				_naoConnection.writeData( message );
			});
			
			socket.on('close', function () {
				
				logger.debug('Client disconnected');
				
			});
			
			logger.debug('Client connected');
			
		}
		
	};

	that.start = function( naoConnection ){
	
		_naoConnection = naoConnection;
		ws.on('connection', newClient );
		
	};

	return that;
	
}());
