class AjaxPromise {

	constructor(){
		this.successCallBacks = [];
		this.errorCallBacks = [];
	}
	success(callback){
		this.successCallBacks.push(callback);
		return this;
	}
	error(callback){
		this.errorCallBacks.push(callback);
		return this;
	}
	resolve(){
		this.successCallBacks.forEach(success => {
			success.call(null, this.response);
		});
	}
	reject(){
		this.errorCallBacks.forEach(error => {
			error.call(null, this.response);
		});
	}
}