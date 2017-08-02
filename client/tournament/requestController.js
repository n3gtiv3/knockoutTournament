class RequestController{


	/**
	 * we create a deque for throttling the number of requests made at a time mainly for
	 * assigning priorities to the api calls and also to prevent stack overflow in the browser
	 *
	 * Winner api call will always have greater priority than other api calls 
	 * to ensure that a match is getting completed ASAP
	 * 
	 * 
	 */
	constructor(){
		//stores all the api calls in the deque
		this.deque = [];
		//this indicates the front index of the deque from which we need to send
		//the next api call
		this.requestCount = 0;
	}
	/**
	 * Sets maximum requests that we allow the service to make at a time
	 * @param {number} teamsPerMatch - number of teams playing in a match
	 */
	setMaxRequests(teamsPerMatch){
		//setting max requests to the number of teams paying a match
		this.maxRequests = teamsPerMatch;
	}
	/**
	 * gets max requests that can be made at a time
	 */
	getMaxRequests(){
		return this.maxRequests;
	}
	pushToDeque(requestObject){
		this.deque.push(requestObject);
		this.makeRequest();
	}
	popDeque(){
		let requestObject =  this.deque[0];
		this.deque.splice(0, 1);
		return requestObject;
	}
	makeRequest(){
		if(this.deque.length === 0 || this.requestCount >= this.getMaxRequests()){
			return ;
		}
		const requestObject = this.popDeque();
		++this.requestCount;
		if(requestObject.requestType === REQUEST_TYPE.GET){
			 HTTPRequest.get(requestObject.url, requestObject.data).then((response) => {
			 	requestObject.callBack.resolve(response);
			 	this.requestCount--;
			 	this.makeRequest();
			 }, (error) => {
					requestObject.callBack.reject(error);
					this.requestCount--;
			 		this.makeRequest();
			 }) ;
		}else{
			 HTTPRequest.post(requestObject.url, requestObject.data).then((response) => {
			 	requestObject.callBack.resolve(response);
			 	this.requestCount--;
			 	this.makeRequest();
			 }, (error) => {
					requestObject.callBack.reject(error);
					this.requestCount--;
			 		this.makeRequest();
			 }) ;
		}
	}
	get(url, data){
		//if request is for winner api call then don't even think of waiting
		//since it gets highest priority; just send the request
		if(url === API_URL.WINNER){
			return HTTPRequest.get(url, data);
		}else{
			//push to the deque and hope for the best
			return new Promise((resolve, reject) => {
				this.pushToDeque({requestType : REQUEST_TYPE.GET, url : url, data : data, callBack : {resolve, reject}});
			});
		}
	}
	post(url, data){
		return HTTPRequest.post(url, data);
	}
}