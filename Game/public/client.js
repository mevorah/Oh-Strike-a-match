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
    setNothingState();
    
    $('#input-field').keydown(function(event){
       if(event.keyCode == 13){
           sendMessage();
       }
    });
    
    $('.option').click(function(a){     
        console.log(a.id);
        selectChoice(a);
    });
});

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

//
// States
//
function setNothingState(){
    $('#game-in-progress-area').hide();
    $('#between-round-area').hide();
    $('#game-area').hide();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();
}

socket.on('game in progress', function(msg){
    $('#game-in-progress-area').show();
    $('#between-round-area').hide();
    $('#game-area').hide();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();
});

socket.on('waiting for players', function(msg){
    $('#game-in-progress-area').hide();
    $('#between-round-area').hide();
    $('#game-area').hide();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').show();
});

socket.on('between rounds', function(){
    $('#game-in-progress-area').hide();
    $('#between-round-area').show();
    $('#game-area').hide();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();

    socket.emit('user ready');
});
          
socket.on('next round', function(round){
    clearChoice();
    setCells(round);

    $('#game-in-progress-area').hide();
    $('#between-round-area').hide();
    $('#game-area').show();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();
    $('#answer-area').text("");  
});

socket.on('round ended', function(msg){
    $('#game-in-progress-area').hide();
    $('#between-round-area').hide();
    $('#game-area').show();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();
    $('#answer-area').text(msg.answer);    
});

socket.on('game over', function(msg){
    $('#game-in-progress-area').hide();
    $('#between-round-area').hide();
    $('#game-area').hide();
    $('#gameover-area').show();
    $('#waiting-for-players-area').hide();
});

//
//Game Functions
//
function clearChoice(){
    choice.numSelected = 0;
    choice.time = 0;
    choice.choice1 = "";
    choice.choice2 = "";
}

function setCells(round){
    for(var i = 0; i < round.options.length; i++){
        var option = round.options[i];
        console.log(round);
        var cellId = '#option-'+round.roundClass+'-'+i;

        console.log(cellId);
        $(cellId).css({backgroundColor: 'transparent'});
        $(cellId).text(option);
    }
    
    $('#round-area').text(round.roundNum);
}
function selectChoice(selected){
    var selectedText = selected.currentTarget.innerText;
    var selectedId = selected.currentTarget.id;
    if(choice.numSelected == 0){
        choice.choice1 = selectedText;
        choice.numSelected++;
        fillCell(selectedId);
    }else if((choice.numSelected == 1) && (selectedText != choice.choice1)){
        choice.choice2 = selectedText;
        choice.numSelected++;
        fillCell(selectedId);        
        
        socket.emit('submitted selection', choice);
    }
}
    
function fillCell(buttonId){
    console.log(buttonId);
    $('#'+buttonId).css({backgroundColor: 'white'});
}










