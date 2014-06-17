/**
 * mrServerConnection
 */

//logging
var log4js = require('log4js');
var logger = log4js.getLogger();
// udp-network
var udp = require('dgram');

var Speaker = require('speaker');

module.exports = (function( spec ){
		
	var that = {};
	var audioServer = null;
	
	var speaker = new Speaker({
	  channels: 2,          
	  bitDepth: 16,         
	  sampleRate: 44100     
	});
	
	// connection
	
	that.createServer = function( port ){
		
		audioServer = udp.createSocket("udp4");
		
		audioServer.on( 'error', function ( error ) {
			
			logger.debug( 'Error in connection (', spec.serverip, ':', spec.serverport, '):\n', error.stack);
			
		});
		
		audioServer.on( 'listening', function () {

			logger.debug( 'Listening for packet from mrserver at', audioServer.address().address + ':' + audioServer.address().port);
			
		});
		
		// connection
		
		audioServer.on('message', function ( message, sender ) {
		
			if( !audioServer.hasOwnProperty(['networkData']) ){
				logger.debug('First connection from ', sender.address, ':', sender.port);
				
				audioServer.networkData  = {};
				audioServer.networkData.address = sender.address;
				audioServer.networkData.port = sender.port;
			
				logger.debug('Connection to', audioServer.networkData.address, ':', audioServer.networkData.port, 'established');
			}
			logger.debug( message );
			speaker.write( message );
			
		});
		
		audioServer.bind( port );
		
	};
	
	that.closeServer = function(){
		
		audioServer.close();
		
	};
	
	that.sendMessage = function( messageObject ){
		
		if( audioServer.hasOwnProperty(['networkData']) ){
			var messageaudioServer = new Buffer( builder.buildObject( messageObject ) );
			
			audioServer.send( messageaudioServer, 0, messageaudioServer.length, audioserver.networkData.port, audioserver.networkData.address );
		}
		
	};
	
	that.testServer = function( port ){
		
		var Readable = require('stream').Readable;
		
		var freq = parseFloat(process.argv[2], 10) || 440.0; // Concert A, default tone

		// seconds worth of audio data to generate before emitting "end"
		var duration = parseFloat(process.argv[3], 10) || 2.0;

		console.log('generating a %dhz sine wave for %d seconds', freq, duration);

		// A SineWaveGenerator readable stream
		var sine = new Readable();
		sine.bitDepth = 16;
		sine.channels = 2;
		sine.sampleRate = 44100;
		sine.samplesGenerated = 0;
		sine._read = read;

		// the Readable "_read()" callback function
		function read (n) {
		  var sampleSize = this.bitDepth / 8;
		  var blockAlign = sampleSize * this.channels;
		  var numSamples = n / blockAlign | 0;
		  var buf = new Buffer(numSamples * blockAlign);
		  var amplitude = 32760; // Max amplitude for 16-bit audio

		  // the "angle" used in the function, adjusted for the number of
		  // channels and sample rate. This value is like the period of the wave.
		  var t = (Math.PI * 2 * freq) / (this.sampleRate * this.channels);

		  for (var i = 0; i < numSamples; i++) {
			// fill with a simple sine wave at max amplitude
			for (var channel = 0; channel < this.channels; channel++) {
			  var s = this.samplesGenerated + i;
			  var val = Math.round(amplitude * Math.sin(t * s)); // sine wave
			  var offset = (i * sampleSize * this.channels) + (channel * sampleSize);
			  buf['writeInt' + this.bitDepth + 'LE'](val, offset);
			}
		  }

		  this.push(buf);

		  this.samplesGenerated += numSamples;
		  if (this.samplesGenerated >= this.sampleRate * duration) {
			// after generating "duration" second of audio, emit "end"
			this.push(null);
		  }
		}
		
		var client = udp.createSocket("udp4");
		var chunk;
		var run = true;
		var i = 1, k = 1;
		while (null !== (chunk = sine.read())) {
			logger.debug('Sending to localhost:', port, ' ', chunk.length, '(Bytes)', i++ );
			//if( i <= 4) speaker.write( chunk );
			logger.debug( chunk );
			client.send( chunk, 0, chunk.length, port, "localhost");
		}
				
	};
	
	return that;
	
})();





