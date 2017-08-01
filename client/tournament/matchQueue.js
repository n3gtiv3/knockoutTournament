class MatchQueue extends PubSub{

	/*
		Match Queue maintains a queue for storing the teams which are currently available
		for conducting a match; We fill the queue until there are sufficient teams available
		to conduct a match;
		@param {List[]} queue - set of queues where each each element in the set will be a queue containing teams
		@param {number} maxTeams - maximum queue size in a round before staring a match
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
	 * @param  {number} key - hash value in which the element has to be pushed
	 * @param  {number} elem - teamId 
	 */
	push(elem, key){
		let roundQueue = [];
		if(this.queue.hasOwnProperty(key)){
			roundQueue = this.queue[key];
		}
		roundQueue.push(elem);
		this.queue[key] = roundQueue;
		if(roundQueue.length === this.maxTeams){
			this.publish(EVENTLISTENER.CONDUCT_MATCH, roundQueue, key);
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