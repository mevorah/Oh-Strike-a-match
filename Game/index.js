var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function(){
   console.log('listening on *:3000'); 
});

app.use(express.static(__dirname + '/public'));

GAME = {
    users: [],
    userThreshold: 2,
    numUsers: function(){ return users.length; },
    nextUserIdToUse: 0,
    nextUserId: function(){ 
        return "user" + GAME.nextUserIdToUse++;
    },
    round: 0;
}

io.on('connection', function(socket){
    userConnected(socket.id, socket);
    
    socket.on('disconnect', function(){
        userDisconnected(socket.id);
    });
    
    socket.on('new message', function(msg){
        newMessage(msg); 
    });
});

function userConnected(socketId, socket){
    console.log("User connected:" + socketId);
    var newUser = 
        {
            socketId: socketId, 
            userId: GAME.nextUserId()
        };
    GAME.users.push(newUser);
    socket.emit('user assign', newUser);
    io.emit('users changed', GAME.users);
    
    if(GAME.numUsers >= GAME.userThreshold){
        startGame();
    }
}
function userDisconnected(socketId){
    console.log("User disconnected:" + socketId);
    
    var userFound = false;
    for(var i = 0; i < GAME.users.length; i++){
        var user = GAME.users[i];
        if(user.socketId == socketId){
            userFound = true;
            GAME.users.splice(i, 1);
        }
    }
    
    if(!userFound){
        console.error("Disconnected user not found in global list of users");
    }
    
    io.emit('users changed', GAME.users)
}

function newMessage(msg){
    io.emit('new message', msg);
}

function startGame(){
    io.emit('next round', {options: ["George", "Apple", "Green", "Umbrella", "Notebook", "Jerry"]});
}