var serialport = require("serialport")
var ttys = [];
var subscribers = {};

exports.subscribe = function(tty, callback, opts, open, close) {
	var rbuf = new Buffer(120), p = 0, timer;

	opts = opts || {};

	subscribers[tty] = new serialport.SerialPort(tty, {
		baudrate: 19200,
		parser: function(emitter, buf) {
			// quick n' dirty, buffer data until a single character
			// width break occurs. does require alot of timers...
			if (timer) {
				clearTimeout(timer);
			}

			timer = setTimeout(function() {
				emitter.emit('data', rbuf.slice(0, p));
				rbuf = new Buffer(120);
				p = 0;
				timer = undefined;
			}, (100000/19200)*2);

			buf.copy(rbuf, p);
			p += buf.length;
		}
	});

	subscribers[tty].on('open', function() {
		console.log('opening tty %s', tty);

		undefined !== open && open();
	});

	subscribers[tty].on('close', function() {
		console.log('closing tty %s', tty);

		undefined !== close && close();
	});

	subscribers[tty].on('close', function(data) {
		delete subscribers[tty];
	});

	subscribers[tty].on('data', callback);

	console.log('subscriber added to %s (opts: %s)', tty, opts);
	return subscribers[tty];
};

exports.list = function() {
	return ttys;
};

serialport.list(function(err, ports) {
	ttys = ports;
});


//function (emitter, buffer) {
//      emitter.emit("data", buffer);
//    },


//var serialPort = new SerialPort("/dev/tty-usbserial1", {
//  baudrate: 57600
//}, false); // this is the openImmediately flag [default is true]
//
//serialPort.open(function () {
//  console.log('open');
//  serialPort.on('data', function(data) {
//    console.log('data received: ' + data);
//  });
//  serialPort.write("ls\n", function(err, results) {
//    console.log('err ' + err);
//    console.log('results ' + results);
//  });
//});
