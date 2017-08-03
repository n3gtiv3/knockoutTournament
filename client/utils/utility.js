/**
 * Utility class to be used by the controllers and services
 */
class Utility{
	/**
	 * Encoding function for a particular match which becomes the key value
	 * for match queue
	 * @param  {number} round 
	 * @param  {number} matchId
	 * @param  {number} teamsPerMatch
	 * @return {string} 
	 */
	static getKey(round, matchId, teamsPerMatch){
		if(round === 0){
			return round + "#" + matchId;
		}
		return round + "#" +  Math.floor(matchId/teamsPerMatch);
	}
	/**
	 * Gets roundId and MatchId for a particular key
	 * @param  {number} key 
	 * @return {List} 
	 */
	static decodeKey(key){
		return key.split("#").map((elem) => elem - "");
	}
	/**
	 * Gets winning score given teams score and winning score
	 * @param  {list} teams - list of teams playing a match
	 * @param  {number} winningScore - winning score for the match
	 * @return {number} 
	 */
	static getWinningTeam(teams, winningScore){
		return teams.filter((team) => team.score === winningScore)
		.reduce((current, next) => {
			return current.teamId < next.teamId ? current : next;
		})
	}
	/**
	 * Returns error message given an error Object with error message
	 * Returns Default error message in case error message is not present
	 * @param  {Object} error 
	 * @return {String}
	 */
	static getErrorMessage(error){
		return (error && error.message) || MESSAGES.DEFAULT_ERROR_MESSAGE;
	}
	/**
	 * Gets total number of matches to be played in the tournament
	 * @param  {number} teamsPerMatch
	 * @param  {number} numberOfTeams
	 * @return {number}
	 */
	static getTotalMatches(teamsPerMatch, numberOfTeams){
		return (numberOfTeams - 1)/(teamsPerMatch - 1)
	}
	/**
	 * Removes all the items from an Array
	 * @param  {List} map
	 * @return {void}
	 */
	static resetMap(map){
		for (let member in map) delete map[member];
		map.length = 0;
	}
}