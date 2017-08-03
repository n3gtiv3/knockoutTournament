/**
 * Tournament Controller enables the functioning of the application
 * It starts the tournament and uses match queue to conduct the matches in the tournament
 *
 */
class TournamentController {
	/**
	 * Model and Tournament Service is injected as the dependency
	 * @param  {Object} model   Model stores the data for the application and talks to the view
	 * @param  {Object} tournamentService Tournament service which is used for making api calls
	 */
	constructor(model, tournamentService){
		this.model = model;
		this.matchQueue = new MatchQueue();
		this.matchQueue.subscribe(EVENTLISTENER.CONDUCT_MATCH, this);
		this.tournamentService = tournamentService;
	}
	/**
	 * resets controller variables
	 * @return {void} 
	 */
	resetController(){
		//reset model
		this.model.reset();
		//reset matchQueue 
		this.matchQueue.reset();
		//Match sent into match queue in bursts of 2
		this.burst = TOURNAMENT.BURST;
	}
	/**
	 * push matches for first round into match queue given the burst size
	 *
	 * @param {number} burstSize    decides how many matches are to be pushed into 
	 *                              the queue at a time;
	 */
	addMatchesToQueue(burstSize){
		//if all the matches are pushed into the queue then return;
		if(burstSize <= 0 || this.matches.length === 0){
			return ;
		}
		//iterate over teams to push all the teams to the queue;
		this.iterateOverTeams(this.matches[0].teamIds, this.matches[0].match);
		//remove top element from the matches array
		this.matches.splice(0,1);
		//recursively add matches to queue with remaining burst size 
		this.addMatchesToQueue(burstSize - 1);
	}
	/**
	 * Iterates over list of teams in a match with given matchId and pushes into the match queue
	 * @param  {List} teams   list of teams
	 * @param  {number} matchId Id of the match
	 * @return {void}        
	 */
	iterateOverTeams(teams, matchId){
		teams.forEach((teamId) => {
				//caculate the hash with which to store the team in the queue
				let teamHash = Utility.getKey(TOURNAMENT.FIRST_ROUND, matchId, this.model.teamsPerMatch);
				//pushing the team inside the list with key as
				this.matchQueue.push(teamId, teamHash);
		});
	}
	/**
	 * Start the tournament given teamsPerMatch and number of teams
	 * @param  {String} teamsPerMatch total teams playing in a match
	 * @param  {String} numberOfTeams [description]
	 * @return {void}              
	 */
	startTournament(teamsPerMatch, numberOfTeams){
		//If any tournament is already in progress then return;
		if(this.model.tournamentInProgress){
			return ;
		}
		//reset the controller
		this.resetController();
		//set input values inside the model
		this.model.saveInititalConfig(teamsPerMatch, numberOfTeams);
		//If something results in an error inside model then return
		if(this.model.error){
			return ;
		}
		//setting max teams which after which the queue will fire an event;
		this.matchQueue.setMaxTeams(this.model.teamsPerMatch);
		//call create tournament service to create tournament;
		this.tournamentService.createTournament(this.model.teamsPerMatch, this.model.numberOfTeams)
		.then((tournamentData) => {
			//save tournament details in the model
			this.model.setTournamentInfo(tournamentData.tournamentId);
			//save first round matches
			this.matches = tournamentData.matchUps;
			//start first round;
			this.addMatchesToQueue(2);
		}, (error) => {
			//publish error to view;
			this.model.setError(ERROR.CREATING_TOURNAMENT, Utility.getErrorMessage(error));
		})
	}
	/**
	 * event handlers call this method for publishing an event
	 * @param  {String}    eventName The event name for which the event is fired
	 * @param  {...[any]} args      Arguments with which the event is published
	 * @return {void}              
	 */
	notify(eventName, ...args){
		if(eventName === EVENTLISTENER.CONDUCT_MATCH){
			this.conductMatch(args[0], args[1]);
		}
	}
	/**
	 * This method conducts a match given a list of teams and a key which denotes roundId and matchId
	 * @param  {List} teams list of teams to conduct a match
	 * @param  {number} key   The hash String comprised of roundId and matchId
	 * @return {void}       
	 */
	conductMatch(teams, key){
		//Decoding the key to get matchId and roundId 
		let [roundId = 0, matchId = 0] = Utility.decodeKey(key);
		this.model.matchStarted(roundId, matchId);
		//removing key since its not required anymore;
		this.matchQueue.remove(key);
		//calling get matchScore service to get current match score
		let matchPromise = this.tournamentService.getMatchScore(this.model.tournamentId, roundId, matchId);
		//getting promises for all the teams in this match;
		let teamPromises = this.getTeamsPromises(teams);
		//resolving promises for all the teams
		Promise.all(teamPromises)
		.then((teamResponse) => {
				//Now that the previous requests are resolved, pushing the next set of matches in first round
				//inside the queue(if there are any)
				this.addMatchesToQueue(2);
				//getting list of team scores from teams list;
				let teamScores = teamResponse.map((team) => team.score);
				matchPromise.then((response) => {
					//calling getWinner service for getting the winner
					this.tournamentService.getWinner(this.model.tournamentId, teamScores, response.score)
					.then((response) => {
						//Get winning team from the winner score response and team scores
						let winningTeam = Utility.getWinningTeam(teamResponse, response.score);
						//removing losing teams promise since we wont need them anymore
						this.model.flushLosingTeams(teamResponse, winningTeam.teamId);
						//getting new key for pushing the winner back to the match queue
						let newKey = Utility.getKey(roundId + 1, matchId, this.model.teamsPerMatch);
						//pushing the winning team to the match queue
						this.matchQueue.push(winningTeam.teamId, newKey);
						//updating model with the match winner
						this.model.updateMatchWinner(roundId, matchId, winningTeam);
					}, (error) => {
						//handle getWinner error;
						this.model.setError(ERROR.GETTING_WINNER, Utility.getErrorMessage(error));
					});
				}, (error) => {
					//handle getMatchScore error
					this.model.setError(ERROR.GETTING_MATCH_SCORE, Utility.getErrorMessage(error));
				});
		}, (error) => {
			//handle teamScores error;
			this.model.setError(ERROR.GETTING_TEAM_SCORES, Utility.getErrorMessage(error));
		});
	}
	/**
	 * Get /team request promises given list of teams
	 * @param  {list} teams List of teams
	 * @return {Promise[]}       
	 */
	getTeamsPromises(teams){
		return teams.map((teamId) => {
			//checks if promise is already present for this team id
			if(!this.model.hasTeam(teamId)){
				//asking tournament service for team promise
				let team = this.tournamentService.getTeamData(this.model.tournamentId, teamId);
				//pushing promise to the model for later use
				this.model.addTeam(teamId, team);
			}
			//returning team promise stored in model
			return this.model.getTeam(teamId);
		})
	}
}