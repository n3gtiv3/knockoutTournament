class TournamentService {

	constructor(){
	}
    createTournament(teamsPerMatch, numberOfTeams) {
    	return HTTPRequest.post("/tournament", {numberOfTeams, teamsPerMatch});
	}
	getTeamData(tournamentId, teamId){
		return HTTPRequest.get("/team", {tournamentId, teamId});

	}
	getMatchScore(tournamentId, round, match){
		return HTTPRequest.get("/match", {tournamentId, round, match});
	}
	getWinner(tournamentId, teamScores, matchScore){
		return HTTPRequest.get("/winner", {tournamentId, teamScores, matchScore});
	}
}