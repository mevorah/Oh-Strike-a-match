var socket = io();
     
var userNames = [];
var me;

/*
    Messaging
*/
socket.on('users changed', function(users){    
    $('#room-list').empty();
    for(var user of users){
        
        if(user.socketId == me.socketId){
            $('#room-list').append('<li><ld id="my-username-text">' + user.userId + '</ld></li>'); 
        }else{
           $('#room-list').append('<li><ld>' + user.userId + '</ld></li>'); 
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
$(document).ready(function(){
   $('#input-field').keydown(function(event){
       if(event.keyCode == 13){
           sendMessage();
       }
   }) 
});

/*
    Game
*/
socket.on('next round', function(round){
    
});