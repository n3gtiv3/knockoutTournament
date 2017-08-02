class HTTPRequest {

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
	static get(url, params){
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