class ClientUtility {


	/**
	 * gets input from the input dom element
	 * @param  {Object} input - object containing number of teams and teams per match dom element
	 * @return {Object}        
	 */
	static getInput(input){
		if(input.numberOfTeams && input.teamsPerMatch){
			return {numberOfTeams : input.numberOfTeams.value , teamsPerMatch : input.teamsPerMatch.value};
		}else{
			return null;
		}
	}
	static getValidMatch(teamsPerMatch) {
	    teamsPerMatch = Math.floor(teamsPerMatch || undefined);

	    if (isNaN(teamsPerMatch)) {
	      return null;
	    }

	    if (teamsPerMatch <= 1) {
	      return null;
	    }

	    return teamsPerMatch;
  	}

	static getValidTeam(numberOfTeams) {
	    numberOfTeams = Math.floor(numberOfTeams || undefined);

	    if (isNaN(numberOfTeams)) {
	      return null;
	    }
	    return numberOfTeams;
	}
	/**
	 * Showing any element in dom
	 * @param  {Object} elem dom object of the element
	 * @return {void}      
	 */
	static showElement(elem){
		elem.style.display = "block";
	}
	/**
	 * hides any element in dom
	 * @param  {Object} elem Dom Object of the element
	 * @return {void}      
	 */
	static hideElement(elem){
		elem.style.display = "none";
	}
	/**
	 * Adds class to the given dom element
	 * @param {Object} elem      Dom element
	 * @param {String} className class to be applied to the element
	 * @return {void}
	 */
	static addClass(elem, className){
		elem.classList.add(className);
	}
	/**
	 * Removes class from the given dom element
	 * @param  {Object} elem      Dom element
	 * @param  {String} className class to be removed from the element
	 * @return {void}           
	 */
	static removeClass(elem, className){
		elem.classList.remove(className);
	}
	static play(audioElement){
		audioElement.play();
	}
}