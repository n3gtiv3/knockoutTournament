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
		//Index for tracking the number of matches for which the requests 
		//of teams is sent; its for tracking only first round matches
		this.matchIndex = 0;
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
		if(burstSize <= 0 || this.matchIndex >= this.matches.length){
			return ;
		}
		//iterate over teams to push all the teams to the queue;
		this.iterateOverTeams(this.matches[this.matchIndex].teamIds, this.matches[this.matchIndex].match);
		//increment the match index
		++this.matchIndex;
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
		this.model.setValues(teamsPerMatch, numberOfTeams);
		//If something results in an error inside model then return
		if(this.model.error){
			return ;
		}
		//setting max teams which after which the queue will fire an event;
		this.matchQueue.setMaxTeams(this.model.teamsPerMatch);
		//call create tournament service;
		this.tournamentService.createTournament(this.model.teamsPerMatch, this.model.numberOfTeams)
		.then((tournamentData) => {
			//save tournament details in the model
			this.model.setTournamentId(tournamentData.tournamentId);
			this.matches = tournamentData.matchUps;
			//start first round;
			this.addMatchesToQueue(2);
		}, (error) => {
			//publish error to view;
			this.model.setError(ERROR.CREATING_TOURNAMENT, Utility.getErrorMessage(error));
			//reset controller if cannot create tournament
			this.resetController();
		})
	}
	notify(eventName, ...args){
		if(eventName === EVENTLISTENER.CONDUCT_MATCH){
			this.conductMatch(args[0], args[1]);
		}
	}
	conductMatch(teams, key){
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
				this.addMatchesToQueue(2);
				//getting list of team scores from teams list;
				let teamScores = teamResponse.map((team) => team.score);
				matchPromise.then((response) => {
					//calling getWinner service for getting the winner
					this.tournamentService.getWinner(this.model.tournamentId, teamScores, response.score)
					.then((response) => {
						let newKey = Utility.getKey(roundId + 1, matchId, this.model.teamsPerMatch);
						let winningTeam = Utility.getWinningTeam(teamResponse, response.score);
						this.matchQueue.push(winningTeam.teamId, newKey);
						this.model.updateMatchWinner(roundId, matchId, winningTeam);
					}, (error) => {
						//handle getWinner error;
						this.model.setError(ERROR.GETTING_WINNER, Utility.getErrorMessage(error));
						//Reset controller if cannot get winner;
						this.resetController();
					});
				}, (error) => {
					//handle getMatchScore error
					this.model.setError(ERROR.GETTING_MATCH_SCORE, Utility.getErrorMessage(error));
					//Reset controller if cannot get match score;
					this.resetController();
				});
		}, (error) => {
			//handle teamScores error;
			this.model.setError(ERROR.GETTING_TEAM_SCORES, Utility.getErrorMessage(error));
			//Reset controller if any request fails 
			this.resetController();
		});
	}
	getTeamsPromises(teams){
		return teams.map((teamId) => {
			//this returns a promise for team 
			if(!this.model.hasTeam(teamId)){
				let team = this.tournamentService.getTeamData(this.model.tournamentId, teamId);
				this.model.addTeam(teamId, team);
			}
			return this.model.getTeam(teamId);
		})
	}
}