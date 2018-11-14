var net = require('net');

// Keep track of the chat clients
var clients = [];

var http = require('http');
var io = require('socket.io');
var port = 3000;

// Start the server at port 3000
var server = http.createServer(function(req, res){ 
    // Send HTML headers and message
    res.writeHead(200,{ 'Content-Type': 'text/html' }); 
    res.end('<h1>Hello Socket Lover!</h1>');
});

server.listen(port);

// Create a Socket.IO instance, passing it our server
var socket = io.listen(server);

// Add a connect listener
socket.on('connection', function(client){ 
    console.log('Connection to client established');
	clients.push(client);
	if(clients.length == 1) {
		console.log("Starting as Host!");
		client.emit("role", "host");
	}
	else {
		client.emit("role", "client");
	}
	
    // Success!  Now listen to messages to be received
    client.on('message',function(event){ 
        console.log('Received message from client!', event);
		//socket.emit("event", "WOW");
    });
	
	client.on('py_ballxy',function(event){ 
        console.log('Received Player_Y val, Ball xy values!', event);
		//client.emit("event", "WOW");
    });
	client.on('py',function(event){ 
        console.log('Received Player_Y', event);
		//client.emit("event", "WOW");
    });

    client.on('disconnect',function(){
        //clearInterval(interval);
        console.log('Server has disconnected');
    });
});

// Start a TCP Server
/*net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort 
  socket.setKeepAlive(true);
  
  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  socket.write("Welcome " + socket.name + "\n");
  broadcast(socket.name + " joined the chat\n", socket);

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    //broadcast(socket.name + "> " + data, socket);
	console.log("RECEIVED: " + data);
	
	
	socket.write("Server to Client Data");
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });
  
  //Throw error
  socket.on('error', (err) => {
	  // handle errors here
	  console.log("Error " + err);
	  //throw err;
	});
  
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(3000);*/

/*var mSocket;
var server = net.createServer((socket) => {
   mSocket = socket;
  console.log('client connected');
  setTimeout(writeToClient, 1500, 'funky');
 
 var timeout = 1
  /hile(true) {
	  console.log("Writing to client!");
	  //setTimeout(writeToClient, timeout * 1500, 'funky');
	  timeout += 1;
  }
  
  //socket.end('goodbye\n');
}).on('error', (err) => {
  // handle errors here
  throw err;
});

server.on('connect', function(data) {
	console.log('Center Received: ' + data);
	//client.destroy(); // kill client after server's response
});

server.on('data', function(data) {
	console.log('Center Received: ' + data);
	writeToClient("Funkier");
	//client.destroy(); // kill client after server's response
});

function writeToClient(info) {
	mSocket.write(info);
}

server.listen(3000, '127.0.0.1');*/