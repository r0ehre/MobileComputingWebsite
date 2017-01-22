var express = require("express");
var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//makes it possible to determine if the user is on mobile or desktop
var device = require('express-device');
app.use(device.capture());

//expose css resources publicly
app.use(express.static('public'));

app.get('/', function(req, res){
    if (req.device.type.toUpperCase() === "DESKTOP") {
        res.sendFile(__dirname + '/desktopController.html');
    } else if (req.device.type.toUpperCase() === "PHONE") {
        res.sendFile(__dirname + '/mobileController.html');
    }
});

var port = process.env.port || 1337;
http.listen(port, function(){
});

io.on('connection', function (socket) {
  socket.on('getSocketIdForRoom', function (data) {
  	console.log("Request by ClientID " + data.clientId + " to get DesktopID of room " + data.roomId + ".");
  	console.log("Returning " + dict[data.roomId] + " to " + data.clientId);
  	io.to(data.clientId).emit('clientIdFromRoomId', { desktopClientId: dict[data.roomId]});
  });
  
  socket.on('inputData', function (data) {
  	console.log("New movement data for room with id " + data.roomId);
  });
  
  socket.on('addRoom', function (data) {
  	console.log("New room created [" + data.roomId + ", " + data.desktopClientId + "]");
    dict[data.roomId] = data.desktopClientId;
  });
  
  socket.on('newClient', function (data) {
  	console.log("New client for room " + data.desktopClientId + " with ClientID " + data.id);
    io.to(data.desktopClientId).emit('newClient', data);
  });
				
  socket.on('newAccelerometerData', function(data) {
    io.to(data.desktopClientId).emit('newAccelerometerData', data);				
  });
  
  socket.on('movementData', function (data) {
    io.to(data.desktopClientId).emit(data);
  });
  
  socket.on('accelerationEvent', function (data) {
    io.to(data.desktopClientId).emit('accelerationEvent', data.isAccelerating);
  });
  
  socket.on('shouldSwitch', function (data) {
    io.to(data.desktopClientId).emit('shouldSwitch', data.shouldSwitch);
  });
});

/**
* Unrelated to this project but don't want to set up another server
*/
var dweetClient = require("node-dweetio");
var dweetio = new dweetClient();
var azure = require('azure');
var notificationHubService = azure.createNotificationHubService('MCSpace', 'Endpoint=sb://mcspace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=Yep2s6KzLJwX2T2q/VSAGIdRWaqnleA3r89ARa4+imc=');

dweetio.listen_for("TECO-SENSOR", "MYoRIg6naWM4Ilx7YWjTX", function() {
	var payload={
    	alert: 'New measurement available!'
  	};
	notificationHubService.apns.send(null, payload, function(error){
  		if(!error){
     		// notification sent
  		}
	});
});

app.get('/simulate/sensor/event/', function(req, res){
	var payload={
    	alert: 'New measurement available!'
  	};
	notificationHubService.apns.send(null, payload, function(error){
  		if(!error){
     		// notification sent
  		}
	});
	res.sendFile(__dirname + '/pushSuccess.html');
});



