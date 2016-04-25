/*jslint vars:true,plusplus:true,devel:true,nomen:true,indent:4,maxerr:100,node:true*/
/*global define */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(3000, function () {
    'use strict';
    console.log('listening on *:3000');
});
app.use(express.static(__dirname + '/public'));

/*
    Objects
*/
var generatedRounds = function () {
    'use strict';
    return [{
        round: 1,
        answer:
            {
                choices: ["George", "Jerry"],
                answer: "Seinfeld"
            },
        clientRound:
            {
                roundNum: 1,
                roundTime: 12,
                roundClass: "a",
                options:
                    [
                        "George",
                        "Apple",
                        "Green",
                        "Umbrella",
                        "Notebook",
                        "Jerry"
                    ]
            }
    }];
};
var GAME = {
    allUsers: [],
    sockets: [],
    gameUsers: [],
    usersReturned: [],
    userThreshold: 2,
    numUsers: function () { 'use strict'; return GAME.allUsers.length; },
    nextUserIdToUse: 0,
    nextUserId: function () {
        'use strict';
        return "user" + GAME.nextUserIdToUse++;
    },
    currentRound: 0,
    rounds: "",
    gameStarted: false,
    countDown: 10
};


function gotoGameOver(){
    console.log("game over");
    sendMessageToInGameUsers('game over', {});
        
    setTimeout(function(){
        cleanupGame();
        io.emit('waiting for players', {});
        checkIfCanStart();
    }, 5000);
}
function cleanupGame(){
    for(var i = 0; i < GAME.allUsers.length; i++){
        GAME.allUsers[i].score = "";
    }
    GAME.gameUsers = [];
    GAME.currentRound = 0;
    GAME.rounds = "";
    GAME.gameStarted = false;
}

function checkIfCanStart() {
    if ((GAME.numUsers() >= GAME.userThreshold) && !GAME.gameStarted) {
        console.log('Starting round');
        startGame();
    }
}

function startGame () {
    initiateGameUsers();
    emitUsersChanged();
    GAME.rounds = generatedRounds();
    GAME.gameStarted = true;
    gotoNextRound();
}

function initiateGameUsers(){
    GAME.gameUsers = [];
    for(var i = 0; i < GAME.allUsers.length; i++){
        var user = GAME.allUsers[i];
        user.score = 0;
        GAME.gameUsers.push(user);
    }
}

function gotoNextRound() {
    if((GAME.currentRound + 1) > GAME.rounds.length) {
        gotoGameOver();
    }else{
        var nextRound = GAME.rounds[GAME.currentRound].clientRound;
        
        var c = GAME.countDown;
        var t = setInterval(function(){
            c--;
            sendMessageToInGameUsers('round countdown', {time: c});
            if(c == 0){
                clearInterval(t);
            }
        }, 1000);
        
        setTimeout(function(){
            clearInterval(t);
            sendMessageToInGameUsers('next round', nextRound);
        }, 1000 * GAME.countDown);
        
        
    }
}

var getUser = function(socket){
    for(var i = 0; i < GAME.allUsers.length; i++){
        var user = GAME.allUsers[i];
        if(user.socketId == socket.id){
            return user;
        }
    }
    console.error("Couldn't find user");
}

var userIsInGame = function(user){
    for(var i = 0; i < GAME.gameUsers.length; i++){
        var gameUser = GAME.gameUsers[i];
        if(gameUser == user){
            return true;
        }
    }
    return false;
}

var getSocket = function(user){
    for(var i = 0; i < GAME.sockets.length; i++){
        var socket = GAME.sockets[i];
        if(socket.id == user.socketId){
            return socket;
        }
    }
    console.error("Couldn't find socket");
}

function userConnected(socketId, socket) {
    GAME.sockets.push(socket);
    
    var newUser =
        {
            socketId: socketId,
            userId: GAME.nextUserId(),
            score: ""
        };
    GAME.allUsers.push(newUser);
    
    // Send signals to client
    socket.emit('user assign', newUser);
    emitUsersChanged();
    if(GAME.gameStarted){
        socket.emit('game in progress', {});
    }else{
        socket.emit('waiting for players', {});
    }
    
    checkIfCanStart();
}

function userDisconnected(socketId){
    console.log("User disconnected:" + socketId);
    
    var userFound = false;
    for(var i = 0; i < GAME.allUsers.length; i++){
        var user = GAME.allUsers[i];
        if(user.socketId == socketId){
            userFound = true;
            GAME.allUsers.splice(i, 1);
        }
    }
    
    for(var i = 0; i < GAME.gameUsers.length; i++){
        var user = GAME.gameUsers[i];
        if(user.socketId == socketId){
            GAME.gameUsers.splice(i, 1);
        }
    }
    
    for(var i = 0; i < GAME.sockets.length; i++){
        var storedSocketId = GAME.sockets[i].id;
        if(storedSocketId == socketId){
            GAME.sockets.splice(i, 1);
        }
    }

    if(!userFound){
        console.error("Disconnected user not found in global list of users");
    }

    emitUsersChanged();
}
function newMessage(msg){
    io.emit('new message', msg);
}
function submittedSelection(userResponse, socket){
    scoreUser
    (
        getUser(socket), 
        userResponse, 
        GAME.rounds[GAME.currentRound]
    );
    
    console.log("socket:"+socket.id +"Submitted sel- Added to user returned");
    GAME.usersReturned.push(socket);    
    
    console.log("usersReturned:"+GAME.usersReturned.length);
    console.log("gameUsers:"+GAME.gameUsers.length);
    
    if(GAME.usersReturned.length >= GAME.gameUsers.length ){
        console.log("Round ended");
        GAME.usersReturned = [];
        
        //send updated score to users
        emitUsersChanged();
        
        //send signal that round ended
        setTimeout(function(){
            sendMessageToInGameUsers('round ended', 
                                 { answer: GAME.rounds[GAME.currentRound].answer.answer });
        }, 1000);        
        
        setTimeout(function(){
            sendMessageToInGameUsers('between rounds', {});
        }, 6000);
    }
}

function sendMessageToInGameUsers(signal, msg){
    for(var i = 0; i < GAME.gameUsers.length; i++){
        var socket = getSocket(GAME.gameUsers[i]);
        socket.emit(signal, msg);
    }
}

function scoreUser(user, userResponse, round){
    console.log("scoring user");
    
    var answer = round.answer;
    var choice1 = userResponse.choice1;
    var choice2 = userResponse.choice2;
    
    var answerMap = [];
    for(var i = 0; i < answer.choices.length; i++){
        var answerChoice = answer.choices[i];
        answerMap.push({choice: answerChoice, used: 0});
    }
    
    for(var i = 0; i < answerMap.length; i++){
        if((choice1 == answerMap[i].choice) || (choice2 == answerMap[i].choice)){
            answerMap[i].used++;
        }
    }
    
    var answeredCorrectly = true;
    for(var i = 0; i < answerMap.length; i++){
        if(answerMap[i].used == 0){
            answeredCorrectly = false;
        }
    }
    
    //Increment score
    if(answeredCorrectly == true){
        user.score += Math.ceil( 1000 * ( userResponse.time / round.clientRound.roundTime) );
    }
}

function userReady(msg, socket){
    console.log("socket:"+socket.id +"User ready - Added to user returned");
    GAME.usersReturned.push(socket);
    
    if(GAME.usersReturned.length == GAME.gameUsers.length ){
        console.log("All users ready for next round");
        GAME.usersReturned = [];
        
        setTimeout(function(){
            GAME.currentRound++;
            gotoNextRound(); 
        }, 3000) 
    }
}

function emitUsersChanged(){
    io.emit('users changed', GAME.allUsers);
}

io.on('connection', function (socket) {
    'use strict';
    userConnected(socket.id, socket);
    
    socket.on('disconnect', function(){
        userDisconnected(socket.id);
    });
    
    socket.on('new message', function(msg){
        newMessage(msg); 
    });
    
    socket.on('submitted selection', function(msg){
        submittedSelection(msg, socket);
    });
    
    socket.on('user ready', function(msg){
        userReady(msg, socket); 
    });
});













