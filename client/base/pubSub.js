/**
 * Publisher subscriber core class which is used by the event handlers
 */
class PubSub {

	constructor(){
		this.subscribers = [];
	}
	/**
	 * Publishes events
	 * @param  {String}    eventName Name of the event
	 * @param  {...any[]} args      Arguments to be passed to the subscribers
	 * @return {void}              
	 */
	publish(eventName, ...args){
		this.notifyAll(eventName, this.subscribers[eventName], ...args);
	}
	/**
	 * Notifies every registered subscribers about the event
	 * @param  {String}    eventName      
	 * @param  {List}    subscriberList list of subscribers of this event
	 * @param  {...any[]} args          Arguments passed to the subscriber
	 * @return {void}                   
	 */
	notifyAll(eventName, subscriberList, ...args){
		subscriberList.forEach((subscriber) => {
			subscriber.notify(eventName, ...args);
		});
	}
	/**
	 * Subcribes any subscriber for a particular event
	 * @param  {String} eventName  Name of the event
	 * @param  {Object} subscriber object reference of the subscriber which is used to notify the subscriber
	 * @return {void}            
	 */
	subscribe(eventName, subscriber){
		let subscriberList = [];
		if(this.subscribers.hasOwnProperty(eventName)){
			subscriberList = this.subscribers[eventName];
		}
		subscriberList.push(subscriber);
		this.subscribers[eventName] = subscriberList;
	}
	/**
	 * Resets all the subscribers
	 * @return {void} 
	 */
	resetSubscribers(){
		Utility.resetMap(this.subscribers);
	}
}