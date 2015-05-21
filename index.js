var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var animals = ["ewe","bull","bear","shrew","deer","mouse","porpoise","lemur","sloth","bee"];
var adjectives = ["pumped", "bouncy", "talented", "guarded", "uppity", "wandering", "abrupt", "stale", "thundering","wry"];

var usedUUIDs = [];
var rooms = {};


var registerUUID = function() {
  var adjective = adjectives[genRandomIndex(adjectives.length)];
  var animal = animals[genRandomIndex(animals.length)];
  var uuid = adjective + "-" + animal;
  if(!_.includes(usedUUIDs,uuid)) {
    //place our uuid into collection
    usedUUIDs[usedUUIDs.length] = uuid;
    return uuid;
  } else {
    return registerUUID();
  }
};

var genRandomIndex = function(limit) {
  return _.random(0,limit,false);
};

var unregisterUUID = function(uuid) {
  if(_.includes(usedUUIDs,uuid)) {
    usedUUIDs = _.remove(usedUUIDs, function(value) {
      return value == uuid;
    });
  }
};

/**
 * This is disgraceful coding but it was a hackathon! ;)
 */
app.get('*', function(req, res){
  var url = req.url.toString();
  if(url.indexOf("client.html")!=-1) {
    url = url.substr(0, url.indexOf("?"));
  }
  res.sendFile(__dirname + url);
});

io.on('connection', function(socket){

  //create uuid and create either a namespace or room unique to that user
  var uuid = registerUUID();
  rooms[uuid] = 1;
  console.log('room generated : ' + uuid);
  socket.join(uuid);
  io.to(uuid).emit('roomID',uuid);

  console.log('user ' + socket.id + ' connected');

  socket.on('disconnect', function(){
    rooms[uuid] += -1;
    if(rooms.uuid < 1){
      console.log("room : " + uuid + " is now empty so removing it...");
      delete rooms.uuid;
    }
    console.log('user ' + socket.id + ' disconnected');
  });
  
  socket.on('camera-pos', function(msg){
    console.log(msg.x);
    io.emit('camera-pos', msg);
  });
  socket.on('camera-ang', function(msg){
    io.emit('camera-ang', msg);
  });
  socket.on('x', function(msg){
    io.emit('x', msg);
  });
  socket.on('y', function(msg){
    io.emit('y', msg);
  });
  socket.on('z', function(msg){
    io.emit('z', msg);
  });
  socket.on('x-delta', function(msg){
    io.emit('x-delta', msg);
  });
  socket.on('y-delta', function(msg){
    io.emit('y-delta', msg);
  });
  socket.on('z-delta', function(msg){
    io.emit('z-delta', msg);
  });
  socket.on('reset', function(msg){
    io.emit('reset', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
