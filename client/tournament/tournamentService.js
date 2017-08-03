/**
 * Tournament Service is responsible for making all the api calls
 * It asks tournament controller to make an HTTP request and return a promise
 */
class TournamentService {
	/**
	 * Injects a request controller
	 * @param  {Object} requestController
	 */
	constructor(requestController){
		this.requestController = requestController;
	}
	/**
	 * makes api call for creating a tournament
	 * @param  {number} teamsPerMatch 
	 * @param  {number} numberOfTeams 
	 * @return {Promise}               
	 */
    createTournament(teamsPerMatch, numberOfTeams) {
    	this.requestController.setMaxRequests(TOURNAMENT.MAX_REQUEST);
    	return this.requestController.post("/tournament", {numberOfTeams, teamsPerMatch});
	}
	/**
	 * makes api call for getting team data
	 * @param  {number} tournamentId 
	 * @param  {number} teamId       
	 * @return {Promise}              
	 */
	getTeamData(tournamentId, teamId){
		return this.requestController.get("/team", {tournamentId, teamId});

	}
	/**
	 * makes an api call for getting match score
	 * @param  {number} tournamentId 
	 * @param  {number} round        
	 * @param  {number} match       
	 * @return {Promise}              
	 */
	getMatchScore(tournamentId, round, match){
		return this.requestController.get("/match", {tournamentId, round, match});
	}
	/**
	 * makes an api call for getting winner of a match given team and match scores
	 * @param  {number} tournamentId 
	 * @param  {number} teamScores   
	 * @param  {number} matchScore   
	 * @return {Promise}              
	 */
	getWinner(tournamentId, teamScores, matchScore){
		return this.requestController.get("/winner", {tournamentId, teamScores, matchScore});
	}

}