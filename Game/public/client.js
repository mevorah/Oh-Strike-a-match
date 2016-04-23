var socket = io();
     
var userNames = [];
var me;
var choice = 
    {
        numSelected: 0,
        time: 0,
        choice1: "",
        choice2: ""
    }

$(document).ready(function(){
    setIdleState();
    
    $('#input-field').keydown(function(event){
       if(event.keyCode == 13){
           sendMessage();
       }
    });
    
    $('.option').click(function(a){
        console.log(a.currentTarget.innerHTML);
        selectChoice(a.currentTarget.innerText);
    });
   
   
});

function setIdleState(){
    console.log("helloasdlkf;ajsdf");
    $('#game-area').hide();
    $('#inbetween-round-area').hide();
    $('#idle-area').show();
}

/*
    Messaging
*/
socket.on('users changed', function(users){    
    $('#room-list').empty();
    for(var user of users){
        
        if(user.socketId == me.socketId){
            $('#room-list').append('<li><ld id="my-username-text">' + user.userId + ' ' + user.score + '</ld></li>'); 
        }else{
           $('#room-list').append('<li><ld>' + user.userId + ' ' + user.score + '</ld></li>'); 
        } 
    }
});
socket.on('user assign', function(user){
    me = user;
}); 
socket.on('new message', function(msg){
    $('#message-list').append('<li><ld>' + msg.user + "   " + msg.content + '</li></ld>');
});
function sendMessage(){
    var message = $('#input-field').val();
    var payload = {user: me.userId, content: message};
    socket.emit('new message', payload);
    $('#input-field').val('');
}

/*
    Game
*/

socket.on('game over', function(msg){
    console.log('game over');
    setIdleState();
});


function emitUserReady(){
    socket.emit('user ready', {});
}

function inbetweenRounds(){
    $('#game-area').hide();
    $('#inbetween-round-area').show();
    $('#idle-area').hide();
    
    window.setTimeout(emitUserReady, 3000);
}
function showAnswer(answer){
    $('#answer-area').text(answer);
}
socket.on('round ended', function(msg){
    console.log("round ended")
    showAnswer(msg.answer);
    window.setTimeout(inbetweenRounds, 6000);
});


function selectChoice(selected){
    if(choice.numSelected == 0){
        choice.choice1 = selected;
        choice.numSelected++;
    }else if(choice.numSelected == 1){
        choice.choice2 = selected;
        choice.numSelected++;
        
        console.log("called");
        socket.emit('submitted selection', choice);
    }
}

function setCells(round){
    for(var i = 0; i < round.options.length; i++){
        var option = round.options[i];
        console.log(round);
        var cellId = '#option-'+round.num+'-'+i;
        console.log(cellId);
        $(cellId).text(option);
    }
}
function showGame(){
    $('#game-area').show();
    $('#inbetween-round-area').hide();
    $('#idle-area').hide();
}
function clearChoice(){
    choice.numSelected = 0;
    choice.time = 0;
    choice.choice1 = "";
    choice.choice2 = "";
}
function clearAnswer(){
    $('#answer-area').text("");
}
function setupGame(round){
    clearChoice();
    clearAnswer();
    setCells(round);
    showGame();
}
socket.on('next round', function(round){
    setupGame(round);
});








