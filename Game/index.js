/*jslint vars:true,plusplus:true,devel:true,nomen:true,indent:4,maxerr:100,node:true*/
/*global define */

var fs = require('fs');
var csv = require('csv-parse/lib/sync');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

'use strict';

http.listen(3000, function () {
    'use strict';
    console.log('listening on *:3000');
});
app.use(express.static(__dirname + '/public'));

/*
    Objects
*/
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var generatedRounds = function () {
    fs.readFile(__dirname + '/questions.csv', 'utf8', function (err,data) {
        var rounds  = [];
        for(var r = 0; r < GAME.numRounds; r++){
            var indices = [];
            var numIndices = 5;
            var records = csv(data, {});
            for(var i = 0; i < numIndices; i++){
                var alreadyUsed = true;
                while(alreadyUsed){
                    var index = Math.floor(Math.random() * records.length);
                    var found = false;
                    for(var j = 0; j < indices.length; j++){
                        if(indices[j] == index){
                            found = true;
                        }
                    }
                    if(!found){
                        alreadyUsed = false;
                        indices.push(index);
                    }
                }   
            }
        
            var round = {
                answer: {
                    answer: "",
                    choices: ["", ""]
                },
                clientRound: {
                    roundNum: 0,
                    roundTime: 12,
                    roundClass: "a",
                    options: []
                }
            };
        
            //Set answer
            var record = records[indices[0]];
            round.answer.answer = record[0];
            var seed = Math.floor(Math.random() * 3);
            round.answer.choices[0] = record[1 + seed];
            round.answer.choices[1] = record[2 + seed];
            round.clientRound.options.push(round.answer.choices[0]);
            round.clientRound.options.push(round.answer.choices[1]);
            
            for(var i = 1; i < indices.length; i++){
                var optionRecord = records[indices[i]];
                var option = optionRecord[Math.floor(1 + Math.random() * 4)];
                round.clientRound.options.push(option);
            }
        
            shuffle(round.clientRound.options);        
            GAME.rounds.push(round);
        }
        console.log(GAME.rounds);
    });       
};

var GAME = {
    allUsers: [],
    sockets: [],
    gameUsers: [],
    usersReturned: [],
    userThreshold: 3,
    numUsers: function () { return this.allUsers.length; },
    nextUserIdToUse: 0,
    nextUserId: function () {
        return "user" + this.nextUserIdToUse++;
    },
    currentRound: 0,
    numRounds: 5,
    roundInProgress: false,
    rounds: [],
    gameStarted: false,
    countDown: 10,
    canStartGame: function() {
        return ((this.numUsers() >= this.userThreshold) && !this.gameStarted);    
    },
    initiateGameUsers: function() {
        for(var i = 0; i < this.allUsers.length; i++){
            var user = this.allUsers[i];
            user.score = 0;
            this.gameUsers.push(user);
        }
    },
    cleanup: function () {
        for(var i = 0; i < GAME.allUsers.length; i++){
            this.allUsers[i].score = "";
        }
        this.gameUsers = [];
        this.currentRound = 0;
        this.rounds = [];
        this.gameStarted = false;
    },
    CONSTANTS: {
        oneSecond: 1000,
        gameOverScreenTime: 5000,
        
    }
};


function gameOver(){
    console.log("[GameState] Game Over");
    
    sendMessageToInGameUsers('game over', {});
    GAME.cleanup();
    
    setTimeout(function(){
        io.emit('waiting for players', {});
        if(GAME.canStartGame()) {
            console.log("[Transition] Going to start game");
            startGame();
        }
    }, GAME.CONSTANTS.gameOverScreenTime);
}

function startGame () {
    console.log('[GameState] Starting Game');
    GAME.initiateGameUsers();
    generatedRounds();
    GAME.gameStarted = true;
    emitUsersChanged();
    console.log("[Transition] Going to first round");
    startNextRound();
}

function startNextRound() {
    if((GAME.currentRound + 1) > GAME.numRounds) {
        console.log("[Transtion] Going to game over");
        gameOver();
    }else{
        console.log("[GameState] Starting round");
               
        //Count down to game
        var c = GAME.countDown;
        var t = setInterval(function(){
            c--;
            sendMessageToInGameUsers('round countdown', {time: c});
            if(c == 0){
                clearInterval(t);
                
                console.log("[GameState] Round started");
                GAME.roundInProgress = true;
                var nextRound = GAME.rounds[GAME.currentRound].clientRound;
                sendMessageToInGameUsers('next round', nextRound);
                setTimeout(bootUnresponsive, 15000);
                
            }
        }, GAME.CONSTANTS.oneSecond);
        
    }
}
                   
function bootUnresponsive(){
    if(!GAME.roundInProgress){
        console.log("No cleanup - round over");
        return;
    }
    
    
    var usersToNotBoot = [];
    
    for(var i = 0; i < GAME.gameUsers.length; i++){
        var gameUser = GAME.gameUsers[i];
        console.log("Game User:"+gameUser.userId);
        var userReturned = false;
        for(var j = 0; j < GAME.usersReturned.length; j++){
            var returnedUser = GAME.usersReturned[j];
            if(gameUser.socketId == returnedUser.socketId){
                console.log("User returned");
                usersToNotBoot.push(gameUser);
                userReturned = true;
            }
        }
        if(!userReturned){
            console.log("booting unresponsibe user:"+gameUser.userId);
            gameUser.score = "";
            var bootedSocket = getSocket(gameUser);
            bootedSocket.emit('game in progress', {});
        }
    }
    
    GAME.gameUsers = usersToNotBoot;
    
    checkAndExecuteIfRoundComplete();
    
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
    
    if(GAME.canStartGame()) {
        startGame();
    }
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
            checkAndExecuteIfRoundComplete();
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
function userSentNewMessage(msg){
    io.emit('new message', msg);
}
function userSubmittedSelection(userResponse, socket){
    // Guard against non game-users from submitting selection
    debugger;
    try {
        if (!userIsInGame(getUser(socket))) {
            return;
        }
    }catch(err){
        //if the socket is invalid, just return
        return;
    }
    
    scoreUser
    (
        getUser(socket), 
        userResponse, 
        GAME.rounds[GAME.currentRound]
    );
    
    console.log("socket:"+socket.id +"Submitted sel- Added to user returned");
    GAME.usersReturned.push(getUser(socket));    
    
    console.log("usersReturned:"+GAME.usersReturned.length);
    console.log("gameUsers:"+GAME.gameUsers.length);
    
    checkAndExecuteIfRoundComplete();
}

function checkAndExecuteIfRoundComplete(){
    if(GAME.usersReturned.length >= GAME.gameUsers.length ){
        console.log("Round ended");
        GAME.roundInProgress = false;
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
            console.log("All users ready for next round");
            GAME.usersReturned = [];
            setTimeout(function(){
                GAME.currentRound++;
                startNextRound(); 
            }, 3000) 
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

function emitUsersChanged(){
    io.emit('users changed', GAME.allUsers);
}

/*
Entry point for all client actions
*/
io.on('connection', function (socket) {
    'use strict';
    userConnected(socket.id, socket);
    
    socket.on('disconnect', function(){
        userDisconnected(socket.id);
    });
    
    socket.on('new message', function(msg){
        userSentNewMessage(msg); 
    });
    
    socket.on('submitted selection', function(msg){
        userSubmittedSelection(msg, socket);
    });
});