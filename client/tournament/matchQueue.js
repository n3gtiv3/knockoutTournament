/**
 * Match Queue maintains a queue for storing the teams which are currently available
 * for conducting a match; We fill the queue until there are sufficient teams available
 * to conduct a match;
 */
class MatchQueue extends PubSub{

	/**
	 * @param {List[]} queue - set of queues where each each element in the set will be a queue containing teams
	 * @param {number} maxTeams - maximum queue size in a round before staring a match
	 */
	constructor(maxTeams){
		super();
		this.queue = [];
	}
	/**
	 * sets maximum teams that is needed to publish an event
	 * @param {number}
	 */
	setMaxTeams(maxTeams){
		this.maxTeams = maxTeams;
	}
	/**
	 * Pushes a team inside the list with some hash

	 * Combination of roundId and matchId uniquely identify a match in the tournament
	 * Hence creating a key from this combination to ensure teams are getting pushed in the 
	 * correct match list in the queue.
	 * 
	 * @param  {number} roundId - Round Id of the match in which this team will compete
	 * @param  {number} matchId - matchId of the match
	 * @param  {number} teamId - teamId of the team to be pushed 
	 */
	push(teamId, key){
		let teamList = [];
		//If the key already contains a list then just push it in that list
		if(this.queue.hasOwnProperty(key)){
			teamList = this.queue[key];
		}
		//pushing teamId to the queue
		teamList.push(teamId);
		//updating the list in queue
		this.queue[key] = teamList;
		//if this list have enough teams to conduct a match then publish an event
		//to the controller for conducting a match
		if(teamList.length === this.maxTeams){
			this.publish(EVENTLISTENER.CONDUCT_MATCH, teamList, key);
		}
	}
	/**
	 * removes a list for the match which is completed
	 * @param  {number} key
	 */
	remove(key){
		delete this.queue[key];
	}
	/**
	 * resets the queue
	 */
	reset(){
		Utility.resetMap(this.queue);
	}	
}