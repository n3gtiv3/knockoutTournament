class TournamentModel extends PubSub{

	constructor(){
		super();
		this.teams = [];
		this.error = false;
	}
	reset(){
		this.publish(EVENTLISTENER.RESET);
		Utility.resetMap(this.teams);
		this.error = false;
	}
	setTournamentId(tournamentId){
		// A new tournament has been created
		this.publish(EVENTLISTENER.TOURNAMENT_CREATED, this.teamsPerMatch, this.numberOfTeams, tournamentId);
		this.tournamentId = tournamentId;
		this.matchesCompleted = 0;
	}
	hasTeam(teamId){
		return this.teams.hasOwnProperty(teamId);
	}
	addTeam(teamId, team){
		this.teams[teamId] = team;
	}
	getTeam(teamId){
		return this.teams[teamId];
	}
	setValues(teamsPerMatch, numberOfTeams){
		teamsPerMatch = ClientUtility.getValidMatch(teamsPerMatch);
		numberOfTeams = ClientUtility.getValidTeam(numberOfTeams);
		if(teamsPerMatch && numberOfTeams){
			this.teamsPerMatch = teamsPerMatch;
			this.numberOfTeams = numberOfTeams;
			this.totalMatches = Utility.getTotalMatches(teamsPerMatch, numberOfTeams);
			this.tournamentInProgress = true;
			this.publish(EVENTLISTENER.TOURNAMENT_INITIATED);
		}else if(!teamsPerMatch){
			this.setError(ERROR.INVALID_INPUT, ERROR_MESSAGE.INVALID_TEAMS_PER_MATCH);
		}else if(!numberOfTeams){
			this.setError(ERROR.INVALID_INPUT, ERROR_MESSAGE.INVALID_NUMBER_OF_TEAMS);
		}
	}
	updateMatchWinner(roundId, matchId, team){
		++this.matchesCompleted;
		this.publish(EVENTLISTENER.MATCH_END, roundId, matchId, team);
		if(this.matchesCompleted === this.totalMatches){
			this.publish(EVENTLISTENER.TOURNAMENT_ENDS, team);
			this.tournamentInProgress = false;
		}
	}
	matchStarted(roundId, matchId){
		this.publish(EVENTLISTENER.MATCH_STARTS, roundId, matchId);
	}
	setError(errorType, errorMessage){
		this.error = true;
		this.tournamentInProgress = false;
		this.publish(EVENTLISTENER.ERROR, errorType, errorMessage);
	}
}