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
      users.push(name);
   }
   else {
      users.splice(users.indexOf(name), 1);
   }
}


io.on("connection", function(client) {

   //Fires on new clients JOIN
   client.on("join", function(name) {
      
      //Define Object Nickname
      client.nickname = name;
      
      //Get all online users and add to 'Online List'
      client.emit("manage chatter", users, "mount");
      
      //Add on join a new user to all open client chats 
      client.broadcast.emit("manage chatter", name, "add");
      
      //Add new user to array of online users
      storeMember(true, name);
      
      //Add the first 5 messages on log queue
      messages.forEach(function(message) {
         client.emit("messages", "<span>" + message.name + ": </span>" + message.data);
      });
      
      //Server Talks: Console Messages
      console.log("\t@" + name + " entrou na sala.");
      console.log("\t#Online: " + users);
   });
   
   //Fires on new incoming MESSAGES
   client.on("messages", function(data) {
      
      //Get User sender nickname
      var nickname = client.nickname;
      
      //Send the message to all open chats
      client.broadcast.emit("messages", "<span>" + nickname + ": </span>" + data);
      
      //Puts self message on sender chat
      client.emit("messages", "<span>" + nickname + ": </span>" + data, "self");
      
      //Store the new message
      storeMessage(nickname, data);
      
      //Server Talks: Console Messages
      console.log("\t" + nickname + " disse: " + data);
      
   });

   //Fires on click CLOSE BUTTON
   client.on("leave", function(name) {
      
      //Remove user from array
      storeMember(false, name);
      
      //Remove user from list of all open client chats 
      client.broadcast.emit("manage chatter", name, "remove");
      
      //Server Talks: Console Messages
      console.log("\t@" + name + " saiu da sala.");
      console.log("\t#Online: " + users);
   });
   
   client.on("kick", function(name) {
      
      //Remove user from list of all open client chats 
      client.broadcast.emit("manage chatter", name, "kick");
      
      //Server Talks: Console Messages
      console.log("\t@" + name + " foi expulso da sala.");
   });
   
   //Fires on WINDOW CLOSE and REFRESH
   client.on("disconnect", function(name) {
      
      //Get User
      var user = client.nickname;
      
      //Remove user from array
      storeMember(false, user);
      
      //Remove user from list of all open client chats 
      client.broadcast.emit("manage chatter", user, "remove");
      
      //Server Talks: Console Messages
      console.log("\t@" + user + " saiu da sala...");
   });

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
   var addr = server.address();
   console.log("Chat server listening at", addr.address + ":" + addr.port);
});



//server.listen(8080);