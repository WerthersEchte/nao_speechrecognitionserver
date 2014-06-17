/**
 * mrServerConnection
 */

//logging
var log4js = require('log4js');
var logger = log4js.getLogger();
// udp-network
var tcp = require('net');

var Speaker = require('speaker');

module.exports = (function( spec ){
		
	var that = {};
	var audioServer = null;
	var naoAudio = null;
	
	var speaker = new Speaker({
	  channels: 2,          
	  bitDepth: 16,         
	  sampleRate: 44100     
	});
	
	// connection
	
	that.createServer = function( port ){
		
		audioServer = tcp.createServer( function( connection ) {
			
			logger.debug('server connected');
			
			connection.on('end', function() {
				logger.debug('server disconnected');
			});
			connection.pipe(speaker);
			naoAudio = connection;
		});
		
		audioServer.listen( port, function() {
			logger.debug('server bound');
		});
		
	};
	
	that.writeData = function( data ){
	
		logger.debug( data );
		if( naoAudio != null ){
			naoAudio.write( data );
		}
		
	}
	
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
		
		var client = tcp.connect({port: port});
		client.on('data', function(data) {
			logger.debug(data.toString());
		});
		client.on('end', function() {
			logger.debug('client disconnected');
		});
		
		var chunk;
		var run = true;
		var i = 1, k = 1;
		while (null !== (chunk = sine.read())) {
			logger.debug('Sending to localhost:', port, ' ', chunk.length, '(Bytes)', i++ );
			client.write( chunk );
		}
				
	};
	
	return that;
	
})();





