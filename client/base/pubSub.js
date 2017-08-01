class PubSub {

	constructor(){
		this.subscribers = [];
	}
	publish(eventName, ...args){
		this.notifyAll(eventName, this.subscribers[eventName], ...args);
	}
	notifyAll(eventName, subscriberList, ...args){
		subscriberList.forEach((subscriber) => {
			subscriber.notify(eventName, ...args);
		});
	}
	subscribe(eventName, subscriber){
		let subscriberList = [];
		if(this.subscribers.hasOwnProperty(eventName)){
			subscriberList = this.subscribers[eventName];
		}
		subscriberList.push(subscriber);
		this.subscribers[eventName] = subscriberList;
	}
	resetSubscribers(){
		Utility.resetMap(this.subscribers);
	}
}