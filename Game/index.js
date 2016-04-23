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
                num: "a",
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
    users: [],
    usersReturned: [],
    userThreshold: 2,
    numUsers: function () { 'use strict'; return GAME.users.length; },
    nextUserIdToUse: 0,
    nextUserId: function () {
        'use strict';
        return "user" + GAME.nextUserIdToUse++;
    },
    currentRound: 0,
    rounds: "",
    gameStarted: false
};


function cleanupGame(){
    GAME = GAME.prototype;
}
function gotoGameOver(){
    /*Display winner*/
    console.log("game over");
    /* time out */
    io.emit('game over', {});
    //cleanupGame();
    //checkIfCanStart();
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
        user.score++;
    }
}

function gotoNextRound() {
    console.log("next round");
    'use strict';
    //Go to next round
    console.log("currentround:"+GAME.currentRound);
    console.log("roundslength:"+GAME.rounds.length);
    
    if((GAME.currentRound + 1) > GAME.rounds.length) {
        gotoGameOver();
    }else{
        var nextRound = GAME.rounds[GAME.currentRound].clientRound;
        io.emit('next round', nextRound);
    }
}
var getUser = function(socket){
    for(var i = 0; i < GAME.users.length; i++){
        var user = GAME.users[i];
        if(user.socketId == socket.id){
            return user;
        }
    }
    console.error("Couldn't find user");
}
function startGame () {
    'use strict';
    GAME.rounds = generatedRounds();
    GAME.gameStarted = true;
    gotoNextRound();
}
function checkIfCanStart() {
    'use strict';
    if ((GAME.numUsers() >= GAME.userThreshold) && !GAME.gameStarted) {
        console.log('Starting round');
        startGame();
    }
}

function userConnected(socketId, socket) {
    if (GAME.gameStarted) {
        //Navigate to landing
        return;
    }
    
    console.log("User connected:" + socketId);
    var newUser =
        {
            socketId: socketId,
            userId: GAME.nextUserId(),
            score: 0
        };
    GAME.users.push(newUser);
    socket.emit('user assign', newUser);
    io.emit('users changed', GAME.users);
    
    checkIfCanStart();
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
    
    GAME.usersReturned.push(socket);
    if(GAME.usersReturned.length == GAME.users.length ){
        console.log("Round ended");
        GAME.usersReturned = [];
        
        //send updated score to users
        emitUsersChanged();
        
        //send signal that round ended
        io.emit('round ended', { answer: GAME.rounds[GAME.currentRound].answer.answer });
    }
}
function userReady(msg, socket){
    GAME.usersReturned.push(socket);
    
    console.log("num usersReturned:"+GAME.usersReturned.length);
    console.log("num users:"+GAME.users.length);
    
    
    if(GAME.usersReturned.length == GAME.users.length ){
        console.log("All users ready for next round");
        GAME.usersReturned = [];
        GAME.currentRound++;
        gotoNextRound();
    }
}

function emitUsersChanged(){
    io.emit('users changed', GAME.users);
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













