/**
 * HTTP Wrapper for the fetch api 
 */

class HTTPRequest {

	/**
	 * It resolves fetch promise for both post and get currently 
	 * @param  {Promise} fetchPromise promise object for fetch request
	 * @param  {Function} resolve     function called on success
	 * @param  {Function} reject      function called on error
	 * @return {void}              
	 */
	static resolveFetch(fetchPromise, resolve, reject){
		fetchPromise.then((response) => {
				let dataPromise;
				if(response.ok){
					let contentType = response.headers.get("content-type");
					//always expecting json value;
					response.json().then((data) => {
							resolve(data);
					});
				}else{
					response.json().then((error) => {
						reject(error);
					});
				}
			}).catch((error) => {
				reject(error);
			});
	}
	/**
	 * Performs a get request and returns a new promise object
	 * @param  {String} url    
	 * @param  {Object} params 
	 * @return {Promise}      
	 */
	static get(url, params = {}){
		let headers = new Headers({
			"Content-Type" : "application/json",
		});
		let options = { 
			   method: 'GET',
               headers: headers,
        };
        url = url + '?' + this.jsonToQueryString(params);
		let request = new Request(url, options);
		return new Promise((resolve, reject) => {
			const fetchPromise = fetch(request)
			this.resolveFetch(fetchPromise, resolve, reject);
		});
	}
	/**
	 * Performs a post request and returns a new promise object
	 * @param  {String} url  
	 * @param  {Object} data 
	 * @return {void}      
	 */
	static post(url, data = {}){
		const headers = {
	      'Accept': 'application/json',
	      'Content-Type': 'application/x-www-form-urlencoded'
	    };
		return new Promise((resolve, reject) => {
			const fetchPromise = fetch(url, {
				method : 'POST',
				body   :  this.jsonToQueryString(data),
				headers : headers
		    })
		    this.resolveFetch(fetchPromise, resolve, reject);
		});
	}
	/**
	 * converts a json object to url encoded string
	 * @param  {Object} json 
	 * @return {String}      
	 */
	static jsonToQueryString(json) {
    return Object.keys(json).map(function(key) {
    		if(json[key] instanceof Array){
    			return json[key].map((elem) => `${encodeURIComponent(key)}=${encodeURIComponent(elem)}`).join('&')
    		}else{
    			return `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`;
    		}
            
        }).join('&');
}

}