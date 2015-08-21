//--------------------------------------------------------------
// Websocket Chat Server - Node.js
// ADS - Restinga | Redes II
//--------------------------------------------------------------
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);
var messages = [];
var users = [];


app.use(express.static(path.resolve(__dirname, 'view')));

console.log("Iniciando Servidor...");


var storeMessage = function(name, data) {
   messages.push({
      name: name,
      data: data
   });
   if (messages.length > 5) {
      messages.shift();
   }
}


var storeMember = function(online, name) {
   if (online) {
      //users.push({name: name});
      users.push(name);
      console.log(users);
   }
   else {
      users.splice(users.indexOf(users.name), 1);
   }
}


io.on("connection", function(client) {


   client.on("join", function(name) {
      
      //Define Object Nickname
      client.nickname = name;
      
      //Get all online users and add to 'Online List'
      client.emit("manage chatter", users, "mount");
      
      //Add on join a new user to all open client chats 
      client.broadcast.emit("manage chatter", name, "add");
      //client.broadcast.emit("add chatter", name);
      
      //Add new user to array of online users
      storeMember(true, name);
      
      //Console Messages
      console.log("\t@" + name + " entrou na sala.");
      console.log("\t#Online: " + users);
      
      
      //users.forEach(function(user) {
      //   client.emit("add chatter", user.name);
      //});
      
      // client.broadcast.emit("add chatter", users);
      
      messages.forEach(function(message) {
         client.emit("messages", message.name + ": " + message.data);
      });

   });

   client.on("messages", function(data) {
      var nickname = client.nickname;
      console.log("\t" + nickname + ": " + data);
      client.broadcast.emit("messages", "<span>" + nickname + ": </span>" + data);
      client.emit("messages", "<span>" + nickname + ": </span>" + data, "self");
      storeMessage(nickname, data);
      console.log(users);
   });


   client.on("disconnect", function(name) {
      var nickname = client.nickname;
      
      storeMember(false, nickname);
      users.forEach(function(user) {
         client.emit("manage chatter", user.name);
      });
      console.log(nickname + " saiu.");
   });


   client.on("leave", function(name) {
      
      storeMember(false, name);
      
      //$("#members ul li:contains(" + self + ")").remove(); //remove usuário
      client.emit("remove chatter", name);
   });

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
   var addr = server.address();
   console.log("Chat server listening at", addr.address + ":" + addr.port);
   console.log(addr.address + ":" + addr.port);
});



//server.listen(8080);