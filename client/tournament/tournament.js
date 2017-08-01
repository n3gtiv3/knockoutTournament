class TournamentController {

	constructor(model){
		this.model = model;
		this.matchQueue = new MatchQueue();
		this.matchQueue.subscribe(EVENTLISTENER.CONDUCT_MATCH, this);
		this.tournamentService = new TournamentService();
	}
	resetController(){
		this.model.reset();
		this.matchQueue.reset();
	}
	//push the matches for first round into match queue with a delay;
	addMatchesToQueue(matches, i){
		if(i === matches.length){
			return ;
		}
		this.iterateOverTeam(matches[i].teamIds, matches[i].match);
		this.addMatchesToQueue(matches, i + 1);
	}
	iterateOverTeam(teams, matchId){
		teams.forEach((teamId) => {
				let teamHash = Utility.getKey(TOURNAMENT.FIRST_ROUND, matchId, this.model.teamsPerMatch);
				this.matchQueue.push(teamId, teamHash);
		});
	}
	createMatchQueue(teamsPerMatch){
		this.matchQueue.setMaxTeams(teamsPerMatch);
	}
	startTournament(teamsPerMatch, numberOfTeams){
		if(this.model.tournamentInProgress){
			return ;
		}
		this.resetController();
		this.model.setValues(teamsPerMatch, numberOfTeams);
		if(this.model.error){
			return ;
		}
		this.delay = Utility.getDelay(this.model.teamsPerMatch);
		this.createMatchQueue(this.model.teamsPerMatch);
		//call create tournament service;
		this.tournamentService.createTournament(this.model.teamsPerMatch, this.model.numberOfTeams)
		.then((tournamentData) => {
			//save tournament details in the model
			this.model.setTournamentId(tournamentData.tournamentId);
			//start first round;
			this.addMatchesToQueue(tournamentData.matchUps, 0);
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