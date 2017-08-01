class TournamentView {

	constructor(model){
		this.model = model;
		model.subscribe(EVENTLISTENER.TOURNAMENT_INITIATED, this);
		model.subscribe(EVENTLISTENER.TOURNAMENT_CREATED, this);
		model.subscribe(EVENTLISTENER.MATCH_STARTS, this);
		model.subscribe(EVENTLISTENER.MATCH_END, this);
		model.subscribe(EVENTLISTENER.TOURNAMENT_ENDS, this);
		model.subscribe(EVENTLISTENER.ERROR, this);
		model.subscribe(EVENTLISTENER.RESET, this);
	}
	notify(eventName, ...args){
		switch (eventName) {
			case EVENTLISTENER.RESET:
				this.resetView();
				break;
		    case EVENTLISTENER.TOURNAMENT_INITIATED:
		    //Do something after the tournament starts;
		    	this.showElement(domElements.loader);
		        break;
		    case EVENTLISTENER.TOURNAMENT_CREATED:
		    //Do Something after Tournament is Created
		    	this.hideElement(domElements.loader);
		    	this.displayMatchBars(args[0], args[1], args[2]);
		    	break;
		    case EVENTLISTENER.MATCH_STARTS:
		    //Do something before the match starts;
		    	this.blinkTile(args[0], args[1]);
		        break;
		    case EVENTLISTENER.MATCH_END:
		    //Do something before the match ends;
		    	this.fillTile(args[0], args[1]);
		    	this.showMatchWinner(args[0], args[1], args[2]);
		        break;
		    case EVENTLISTENER.TOURNAMENT_ENDS:
		    //Do something after the tournament is over;
		    	this.resetMessage();
		    	this.announceWinner(args[0]);
		        break;
		    case EVENTLISTENER.ERROR:
		    //Do something IN CASE OF ERROR;
		    	this.handleError(args[0], args[1]);
		        break;
		    default :
		    //Handle default case;
		}
	}
	handleError(errorType, errorMessage){
		this.showMessage(errorMessage, true);
		this.hideElement(domElements.loader);
	}
	showMatchWinner(round, match, team){
		let message = `Winner of Round - ${round + 1}, Match - ${match + 1} is ${team.name}`;
		this.showMessage(message);
	}
	resetView(){
		this.hideElement(domElements.winnerElem.parentElement);
		this.hideElement(domElements.tournamentProgress.progress);
		this.hideElement(domElements.cocGif);
		this.resetMessage();
	}
	announceWinner(winningTeam){
		this.hideElement(domElements.cocGif);
		domElements.winnerElem.innerHTML = winningTeam.name;
		this.showElement(domElements.winnerElem.parentElement);
	}
	getId(round, match){
		return `match${round}T${match}`;
	}
	fillTile(round, match){
		let id = `#${this.getId(round, match)}`;
		let currentMatch = domElements.tournamentProgress.matches.querySelector(id);
		this.removeClass(currentMatch, "blink");
		this.addClass(currentMatch, "done");
	}
	blinkTile(round, match){
		let id = `#${this.getId(round, match)}`;
		let currentMatch = domElements.tournamentProgress.matches.querySelector(id);
		this.addClass(currentMatch, "blink");
	}
	showElement(elem){
		elem.style.display = "block";
	}
	hideElement(elem){
		elem.style.display = "none";
	}
	showMessage(message, isError){
		domElements.messageElem.innerHTML = message;
		if(isError){
			this.addClass(domElements.messageElem, "error");
		}else{
			this.removeClass(domElements.messageElem, "error");
		}
	}
	resetMessage(){
		domElements.messageElem.innerHTML = '';
	}
	addClass(elem, className){
		elem.classList.add(className);
	}
	removeClass(elem, className){
		elem.classList.remove(className);
	}
	resetMatchList(){
		const matches = domElements.tournamentProgress.matches;
		while (matches.children[1]) {
		    matches.removeChild(matches.children[1]);
		}
	}
	displayMatchBars(teamsPerMatch, numberOfTeams, tournamentId){
		this.showElement(domElements.cocGif);
		this.resetMatchList();
		let round = 0, match = 0, matchesPerRound = numberOfTeams/teamsPerMatch;
		const defaultNode = domElements.tournamentProgress.match;
		while(matchesPerRound >= 1){
			match = 0;
			for(let i = 0; i < matchesPerRound; i++){
				const matchId = this.getId(round, match);
				const nextMatch = defaultNode.cloneNode(true);
				this.showElement(nextMatch);
				nextMatch.setAttribute("id", matchId);
				domElements.tournamentProgress.matches.appendChild(nextMatch);
				match++;
			}
			round++;
			matchesPerRound/=teamsPerMatch;
		}
		//Now hide defaultNode
		this.hideElement(defaultNode);
		//show progress bar
		this.showElement(domElements.tournamentProgress.progress);
		//show message that tournament has been created
		this.showMessage(MESSAGES.TOURNAMENT_CREATED + tournamentId);
	}
}