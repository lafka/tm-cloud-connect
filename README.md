# Tinymesh Cloud Connectivity

Connects you to the cloud!

Early development, but will serve as the simplest way to connect to
the cloud.


```bash
# Example, connect to the cloud from CLI
usr@localhost $ tm-connect foreground /dev/ttyUSB0
subscriber added to /dev/ttyUSB0 (opts: [object Object])
opening tty /dev/ttyUSB0
SOCK: 0a 00 00 00 00 00 03 10 00 00
UART: 23 01 00 00 00 01 ...
....

# Start a GUI for managing connections
usr@localhost $ tm-connect
```

Built on Node.js using node-webkit, node-commander and node-serialport.
