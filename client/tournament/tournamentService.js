class TournamentService {
	/**
	 * @param  {Object} httpRequest - httpRequest wrapper for making fetch calls
	 */
	constructor(requestController){
		this.requestController = requestController;
	}
    createTournament(teamsPerMatch, numberOfTeams) {
    	this.requestController.setMaxRequests(TOURNAMENT.MAX_REQUEST);
    	return this.requestController.post("/tournament", {numberOfTeams, teamsPerMatch});
	}
	getTeamData(tournamentId, teamId){
		return this.requestController.get("/team", {tournamentId, teamId});

	}
	getMatchScore(tournamentId, round, match){
		return this.requestController.get("/match", {tournamentId, round, match});
	}
	getWinner(tournamentId, teamScores, matchScore){
		return this.requestController.get("/winner", {tournamentId, teamScores, matchScore});
	}

}