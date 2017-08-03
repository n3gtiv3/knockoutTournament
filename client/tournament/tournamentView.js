/**
 * Tournament view subscribes to the model for some events that happens in a tournamen
 * It then updates the dom accordingly by using dom apis
 */
class TournamentView {

	/**
	 * Injects a model and subscribes to only those events that this view needs
	 * @param  {Object} model 
	 */
	constructor(model){
		//subscribing for events
		model.subscribe(EVENTLISTENER.TOURNAMENT_INITIATED, this);
		model.subscribe(EVENTLISTENER.TOURNAMENT_CREATED, this);
		model.subscribe(EVENTLISTENER.MATCH_STARTS, this);
		model.subscribe(EVENTLISTENER.MATCH_END, this);
		model.subscribe(EVENTLISTENER.TOURNAMENT_ENDS, this);
		model.subscribe(EVENTLISTENER.ERROR, this);
		model.subscribe(EVENTLISTENER.RESET, this);
	}
	/**
	 * Event handlers call this method when notifying about the occurence of any event
	 * @param  {String}    eventName Name of the event 
	 * @param  {...any[]} args       Arguments that is passed along by the publisher
	 * @return {void}              
	 */
	notify(eventName, ...args){
		switch (eventName) {
			case EVENTLISTENER.RESET:
			//resetting the view
				this.resetView();
				break;
		    case EVENTLISTENER.TOURNAMENT_INITIATED:
		    //Show loader after tournament is initiated
		    	ClientUtility.showElement(domElements.loader);
		        break;
		    case EVENTLISTENER.TOURNAMENT_CREATED:
		    //hide loader and display the tiles representing status of all the 
		    //matches in the tournament
		    	ClientUtility.hideElement(domElements.loader);
		    	//display coc fife while the tournament is in progress
		    	ClientUtility.showElement(domElements.cocGif);
		    	this.displayMatchTiles(args[0], args[1], args[2]);
		    	break;
		    case EVENTLISTENER.MATCH_STARTS:
		    //After a match has started, blink a tile which denotes that the match is in progress
		    	this.blinkTile(args[0], args[1]);
		        break;
		    case EVENTLISTENER.MATCH_END:
		    //After the match has ended fill the tile and display match winner
		    	this.fillTile(args[0], args[1]);
		    	this.showMatchWinner(args[0], args[1], args[2]);
		        break;
		    case EVENTLISTENER.TOURNAMENT_ENDS:
		    //Reset log messages and display tournament winner
		    	this.resetMessage();
		    	this.announceWinner(args[0]);
		        break;
		    case EVENTLISTENER.ERROR:
		    //Handle any error that might occur in the tournament
		    	this.handleError(args[0], args[1]);
		        break;
		}
	}
	/**
	 * Handles error that occur in tournament
	 * @param  {String} errorType    Type of error
	 * @param  {String} errorMessage error message that needs to be displayed
	 * @return {void}              
	 */
	handleError(errorType, errorMessage){
		this.showMessage(errorMessage, true);
		ClientUtility.hideElement(domElements.loader);
	}
	/**
	 * Show match winner to the user
	 * @param  {number} round RoundId of the match
	 * @param  {number} match id of the match
	 * @param  {Object} team  Team information of the winning team
	 * @return {void}       
	 */
	showMatchWinner(round, match, team){
		let message = `Winner of Round - ${round + 1}, Match - ${match + 1} is ${team.name}`;
		this.showMessage(message);
	}
	/**
	 * Resets the view to the initial state
	 * @return {void} 
	 */
	resetView(){
		ClientUtility.hideElement(domElements.winnerElem.parentElement);
		ClientUtility.hideElement(domElements.tournamentProgress.progress);
		ClientUtility.hideElement(domElements.cocGif);
		this.resetMatchList();
		this.resetMessage();
	}
	/**
	 * Display Tournament winner to the user 
	 * @param  {Object} winningTeam Info of the winning team
	 * @return {void}             
	 */
	announceWinner(winningTeam){
		ClientUtility.hideElement(domElements.cocGif);
		domElements.winnerElem.innerHTML = winningTeam.name;
		ClientUtility.showElement(domElements.winnerElem.parentElement);
	}
	/**
	 * Fetches id of the tile which represents a match
	 * @param  {number} round 
	 * @param  {number} match 
	 * @return {String}       
	 */
	getId(round, match){
		return `match${round}T${match}`;
	}
	/**
	 * Fills tile with colour given a round and a match
	 * @param  {[type]} round [description]
	 * @param  {[type]} match [description]
	 * @return {[type]}       [description]
	 */
	fillTile(round, match){
		//id of the tile representing a match
		let id = `#${this.getId(round, match)}`;
		let currentMatch = domElements.tournamentProgress.matches.querySelector(id);
		//removing blink class
		ClientUtility.removeClass(currentMatch, "blink");
		//adding done class
		ClientUtility.addClass(currentMatch, "done");
	}
	/**
	 * Blinks a tile which denotes that the match is in progress
	 * @param  {number} round 
	 * @param  {number} match 
	 * @return {void}       
	 */
	blinkTile(round, match){
		let id = `#${this.getId(round, match)}`;
		let currentMatch = domElements.tournamentProgress.matches.querySelector(id);
		ClientUtility.addClass(currentMatch, "blink");
	}
	/**
	 * Shows message to the user
	 * @param  {String}  message - Message to be shown to the user
	 * @param  {Boolean} isError - Checks if its an error message
	 * @return {void}          
	 */
	showMessage(message, isError){
		domElements.messageElem.innerHTML = message;
		if(isError){
			ClientUtility.addClass(domElements.messageElem, "error");
		}else{
			ClientUtility.removeClass(domElements.messageElem, "error");
		}
	}	
	/**
	 * resets message displayed
	 * @return {void} 
	 */
	resetMessage(){
		domElements.messageElem.innerHTML = '';
	}
	
	/**
	 * removes all the match tiles
	 * @return {void} 
	 */
	resetMatchList(){
		const matches = domElements.tournamentProgress.matches;
		while (matches.children[1]) {
		    matches.removeChild(matches.children[1]);
		}
	}
	/**
	 * Displays match tiles by cloning base tile template
	 * @param  {number} teamsPerMatch 
	 * @param  {number} numberOfTeams 
	 * @param  {number} tournamentId  
	 * @return {void}               
	 */
	displayMatchTiles(teamsPerMatch, numberOfTeams, tournamentId){

		let round = 0, match = 0, matchesPerRound = numberOfTeams/teamsPerMatch;
		//the tile node template which will be used in clonning
		const defaultNode = domElements.tournamentProgress.match;
		//set display property to block for the default node to show all the clone nodes
		ClientUtility.showElement(defaultNode);
		//looping through all the rounds
		while(matchesPerRound >= 1){
			match = 0;
			//looping through all matches in the round and creating nodes
			for(let i = 0; i < matchesPerRound; i++){
				//id of the match which will be unique per (roundId, matchId)
				const matchId = this.getId(round, match);
				//cloning the base node to create a match tile
				const nextMatch = defaultNode.cloneNode(true);
				//assiging id to the element
				nextMatch.setAttribute("id", matchId);
				//add this tile to the dom
				domElements.tournamentProgress.matches.appendChild(nextMatch);
				//increment match counter
				match++;
			}
			//increment round counter
			round++;
			//now the next round will have (matchesPerRound/teamsPerMatch) number of matches
			matchesPerRound/=teamsPerMatch;
		}
		//Now hide defaultNode
		ClientUtility.hideElement(defaultNode);
		//show progress bar
		ClientUtility.showElement(domElements.tournamentProgress.progress);
		//show message that tournament has been created
		this.showMessage(MESSAGES.TOURNAMENT_CREATED + tournamentId);
	}
}