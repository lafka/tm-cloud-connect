var tty = require('./src/tty');
var net = require('net');
var remote = "31.169.50.34";

angular.module('tmconnect', [])
	.controller('ttys', function($scope) {
		$scope.ttys = [];
		$scope.tty  = undefined;

		$scope.setTTY = function(tty) {
			$scope.tty = tty;
			$scope.$broadcast('settty', tty.comName);
		};

		$scope.fetchTTYs = function() {
			$scope.ttys = tty.list();
		};

		setTimeout(function() {
			$scope.$apply($scope.fetchTTYs);
		}, 100);
	})
	.controller('terminal', function($scope) {
		$scope.output = '';
		$scope.client = null;

		$scope.dump = function(data) {
			var output = new String(), addressPadding = "0000000";
			var line = 0, countForCurrentLine = 0;

			output += "00000000  ";

			for (var i = 0; i < data.length; i++) {
				countForCurrentLine++
				var number = data.charCodeAt(i) & 0xff;
				var byteHex = (number < 16) ? "0" + number.toString(16) : number.toString(16);;

				output += byteHex + " ";
				if (countForCurrentLine == 16) {
					countForCurrentLine = 0;
					line++;
					output += "\n" + addressPadding.substr(0, 7 - line.toString(16).length) + line.toString(16) + "0  ";
				}
			}
			return output;
		};

		var mutex = false;
		$scope.append= function(content) {
			while (mutex) {}

			$scope.output += content;
			var pre = document.getElementById('term');
			pre.scrollTop = pre.scrollHeight;

			mutex = false;
		};

		$scope.$on('settty', function(ev, dev) {
			if ($scope.client) {
				$scope.append("# Info: Closing existing socket\r\n");
				$scope.client.end();
			}

			$scope.append("# Info: Loading TTY @ " + dev + "\r\n");

			$scope.port = tty.subscribe(dev, function(buf) {
				$scope.client.write(buf);
				$scope.$apply(function() {
					$scope.append("\r\nUart Received:\r\n" + $scope.dump(buf.toString('ascii')) + "\r\n");
				});
			}, {}, function() {
				$scope.append("# Info: Successfully attached to tty\r\n");
				$scope.client = net.connect(7001, remote);
				$scope.client.setKeepAlive(true, 3000);

				$scope.append("# Info: Connecting to " + remote + ":" + 7001 + "\r\n");

				$scope.client.on('data', function(buf) {
					$scope.port.write(buf);
					$scope.$apply(function() {
						$scope.append("\r\nSocket Received:\r\n" + $scope.dump(buf.toString('ascii')) + "\r\n");
					});
				});

				$scope.client.on('error', function(err) {
					$scope.$apply(function() {
						$scope.append("\r\nAn error occured, trying to reconnect\r\n");
					});
				});

				$scope.client.on('close', function() {
					$scope.$apply(function() {
						$scope.append("# Info: Socket closed\r\n");
					});
				});
			});

		});
	});
