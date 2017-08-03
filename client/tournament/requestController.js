/**
 * we create a deque for throttling the number of requests made at a time mainly for
 * assigning priorities to the api calls and also to prevent overloading browser stack
 *
 * Winner api call will always have greater priority than other api calls 
 * to ensure that a match is getting completed ASAP
 */
class RequestController{


	constructor(){
		//stores all the api calls in the deque
		this.deque = [];
		//the total requests sent currently
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
	/**
	 * Pushes to deque and calls make request function
	 * @param  {object} requestObject request configurations
	 * @return {void}               
	 */
	pushToDeque(requestObject){
		this.deque.push(requestObject);
		this.makeRequest();
	}
	/**
	 * pops an element from the deque and returns the request object which
	 * contains all the information about making actual http request
	 * @return {[type]} [description]
	 */
	popDeque(){
		let requestObject =  this.deque[0];
		this.deque.splice(0, 1);
		return requestObject;
	}
	/**
	 * Makes an http request if current request count is less than max requests 
	 * allowed at a time
	 * @return {void} 
	 */
	makeRequest(){
		//if deque is empty or we have already made maximum allowed requests then 
		//simply return
		if(this.deque.length === 0 || this.requestCount >= this.getMaxRequests()){
			return ;
		}
		//poping deque and getting the request object
		const requestObject = this.popDeque();
		//incrementing request count since we are about to make a request
		++this.requestCount;
		//checks whether the request type is get or post
		//currently handling get and post requests in the same way
		let httpPromise;
		if(requestObject.requestType === REQUEST_TYPE.GET){
			//Makes http get request 
			httpPromise = HTTPRequest.get(requestObject.url, requestObject.data);
		}else{
			//Makes http get request 
			httpPromise = HTTPRequest.post(requestObject.url, requestObject.data);
		}
		//Now resolve the http promise
		this.resolvePromise(httpPromise, requestObject)
	}
	/**
	 * resolves http promise given a http promise and request callbacks
	 * @param  {promise} httpPromise Http request promise
	 * @param  {object} request object which contains the callbacks
	 * @return {void}             
	 */
	resolvePromise(httpPromise, requestObject){
		httpPromise.then((response) => {
			 	//resolve the request with the callback provided earlier
			 	requestObject.callBack.resolve(response);
			 	//now subtract request count since request promise is resolved
			 	this.requestCount--;
			 	//now we can make another http request
			 	this.makeRequest();
			 }, (error) => {
			 	//in case of an error call the reject function provided earlier
				requestObject.callBack.reject(error);
				//Now we can delete the deque since an error has occured in the tournament
				//and we cannot now proceed with the remaining matches
				this.deleteDeque();
		}) ;
	}
	/**
	 * delete the deque
	 * @return {void} 
	 */
	deleteDeque(){
		Utility.resetMap(this.deque);
	}
	/**
	 * Based on the priority of the api call either push it to the deque 
	 * or directly making the call
	 * @param  {String} url  url with which request has to be made
	 * @param  {Object} data data object containing request parameters
	 * @return {promise}   returns a promise
	 */
	get(url, data){
		//if request is for winner api call then don't anything and make the call
		//since it gets highest priority;
		if(url === API_URL.WINNER){
			//returns http get request
			return HTTPRequest.get(url, data);
		}else{
			//push to the deque and hope for the best
			return new Promise((resolve, reject) => {
				//push to deque withe the request object contining request type, 
				//url, data and callbackd
				this.pushToDeque({
				requestType : REQUEST_TYPE.GET,
				url : url, data : data, 
				callBack : {resolve, reject}
				});
			});
		}
	}
	/**
	 * currently not using queue logic for post calls
	 * we currently have only 1 post call and at the very beginning
	 * so directly make the call.
	 * @param  {String} url  url of the current request
	 * @param  {Object} data Parameters which needs to be sent for this request
	 * @return {promise}      
	 */
	post(url, data){
		return HTTPRequest.post(url, data);
	}
}