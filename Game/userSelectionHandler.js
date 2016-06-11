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