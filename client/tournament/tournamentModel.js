/**
 * TournamentModel stores all the relevant data necessary for conducting a match
 * and it notifies all the view subscribers about any event occuring in the tournament
 */
class TournamentModel extends PubSub{

	constructor(){
		super();
		//teams list stores the promises for teams data with index as teamId
		this.teams = [];
		//error is set as false by default
		this.error = false;
	}
	/**
	 * resets the model by deleleting all the existing data and going back to the initial state
	 * @return {[type]} [description]
	 */
	reset(){
		//Notifies view to reset 
		this.publish(EVENTLISTENER.RESET);
		//deleting all the teams info
		Utility.resetMap(this.teams);
		//setting error back to false
		this.error = false;
	}
	/**
	 * sets the initial tournament information
	 * @param {[type]} tournamentId [description]
	 */
	setTournamentInfo(tournamentId){
		//Notify view that a new tournament has been created
		this.publish(EVENTLISTENER.TOURNAMENT_CREATED, this.teamsPerMatch, this.numberOfTeams, tournamentId);
		//saving the tournamentId
		this.tournamentId = tournamentId;
		//this variable counts the total number matches completed in the tournament
		this.matchesCompleted = 0;
	}
	/**
	 * checks if this team is present in the model
	 * @param  {number}  teamId Team id of the team
	 * @return {Boolean}        
	 */
	hasTeam(teamId){
		return this.teams.hasOwnProperty(teamId);
	}
	/**
	 * adds team with given team id to the model
	 * @param {number} teamId 
	 * @param {Object} team   Team promise object
	 */
	addTeam(teamId, team){
		this.teams[teamId] = team;
	}
	/**
	 * returns team data given a team id
	 * @param  {number} teamId 
	 * @return {Object}        
	 */
	getTeam(teamId){
		return this.teams[teamId];
	}
	/**
	 * saves initial configuration after verifying the correctness
	 * @param {number} teamsPerMatch teams playing in a match
	 * @param {number} numberOfTeams number of teams in tournament
	 */
	saveInititalConfig(teamsPerMatch, numberOfTeams){
		//validates teamsPerMatch input
		teamsPerMatch = ClientUtility.getValidMatch(teamsPerMatch);
		//validates number of teams input
		numberOfTeams = ClientUtility.getValidTeam(numberOfTeams);
		//checks if input is valid
		if(teamsPerMatch && numberOfTeams){
			//saving the configurations
			this.teamsPerMatch = teamsPerMatch;
			this.numberOfTeams = numberOfTeams;
			//total number of matches to be played in the tournament
			this.totalMatches = Utility.getTotalMatches(teamsPerMatch, numberOfTeams);
			//tournament in progress
			this.tournamentInProgress = true;
			//notifying the views that tournament is initiated 
			this.publish(EVENTLISTENER.TOURNAMENT_INITIATED);
		}else if(!teamsPerMatch){
			//invalid teams per match error
			this.setError(ERROR.INVALID_INPUT, ERROR_MESSAGE.INVALID_TEAMS_PER_MATCH);
		}else if(!numberOfTeams){
			//invalid teams number of teams error
			this.setError(ERROR.INVALID_INPUT, ERROR_MESSAGE.INVALID_NUMBER_OF_TEAMS);
		}
	}
	/**
	 * Updates match winner to the view and if tournament is completed then updates final winner
	 * @param  {number} roundId roundId of the match
	 * @param  {number} matchId id of the match
	 * @param  {Object} team    team who won the match
	 * @return {void}         
	 */
	updateMatchWinner(roundId, matchId, team){
		//incrementing the total matches completed;
		++this.matchesCompleted;
		//notifying that a match has ended
		this.publish(EVENTLISTENER.MATCH_END, roundId, matchId, team);
		//if all the matches are completed then update tournament winner
		if(this.matchesCompleted === this.totalMatches){
			//notifying view about the tournament winner
			this.publish(EVENTLISTENER.TOURNAMENT_ENDS, team);
			//now no tournament is in progress
			this.tournamentInProgress = false;
		}
	}

	flushLosingTeams(teams, winningTeamId){
		teams = teams.filter((team) => {
			return team.teamId === winningTeamId;
		});
	}

	/**
	 * notifies the view that a match has started
	 * @param  {number} roundId 
	 * @param  {number} matchId 
	 * @return {void}         
	 */
	matchStarted(roundId, matchId){
		this.publish(EVENTLISTENER.MATCH_STARTS, roundId, matchId);
	}
	/**
	 * Handles any error that might have occured in the tournament
	 * @param {String} errorType    type of error that occured
	 * @param {String} errorMessage Message about the error
	 */
	setError(errorType, errorMessage){
		//setting error flag to true
		this.error = true;
		//now tournament cannot continue, so no tournament is in progress
		this.tournamentInProgress = false;
		//notifying the views about any error
		this.publish(EVENTLISTENER.ERROR, errorType, errorMessage);
	}
}