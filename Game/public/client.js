var socket = io();
     
var userNames = [];
var me;
var playing;
var choice = 
    {
        numSelected: 0,
        time: 0,
        choice1: "",
        choice2: ""
    }

var soundUrls = ['A.m4a', 'B.m4a', 'C.m4a'];

$(document).ready(function(){
    setNothingState();
    
    $('#input-field').keydown(function(event){
       if(event.keyCode == 13){
           sendMessage();
       }
    });
    
    $('.option').click(function(a){ 
        
        playClap();
        
        console.log(a.id);
        selectChoice(a);
    });
});

function playClap(){
    var index = Math.floor(Math.random() * soundUrls.length);
    console.log(index);
    var soundUrl = soundUrls[index];
    var sound = new Howl({
        urls: [soundUrl]
    }).play();
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
    if(msg.user == me.userId){
        $('#message-list').append('<li><ld id="my-username-text">' + msg.user + "   " + msg.content + '</li></ld>');
    }else{
        $('#message-list').append('<li><ld>' + msg.user + "   " + msg.content + '</li></ld>');
    }
    
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
    clearInterval(gameTimer);
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
});

socket.on('round countdown', function(msg){
    console.log('round countdown');
    $('#game-in-progress-area').hide();
    $('#between-round-area').show();
    $('#game-area').hide();
    $('#gameover-area').hide();
    $('#waiting-for-players-area').hide();
    $('#round-countdown-field').text(msg.time);
});
 
socket.on('next round', function(round){
    console.log("next round starting");
    clearChoice();
    setCells(round);
    startTimer(round.roundTime);
    
    $('#time-area').text("12");
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
    
    $('#answer-area').text("");  
    $('#round-countdown-field').text(round.roundTime);
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
        
        clearInterval(gameTimer);
        socket.emit('submitted selection', choice);
    }
}
    
function fillCell(buttonId){
    console.log(buttonId);
    $('#'+buttonId).css({backgroundColor: 'white'});
}

var gameTimer;
function startTimer(time){
    var gameTime = time;
    gameTimer = setInterval(function(){
        gameTime--;
        choice.time = gameTime;
        $('#time-area').text(gameTime);
        if(gameTime <= 0){
            $('#time-area').text("0");
            clearInterval(gameTimer);
            socket.emit('submitted selection', choice);
        }
    }, 1000);
}







