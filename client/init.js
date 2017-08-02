
(() => {

const tournamentModel = new TournamentModel();
const tournamentView = new TournamentView(tournamentModel);
const requestController = new RequestController();
const tournamentService = new TournamentService(requestController);
const tournamentController = new TournamentController(tournamentModel, tournamentService);


document.addEventListener('DOMContentLoaded', () => {
  domElements.startButton.addEventListener('click', () => {
  		let {numberOfTeams, teamsPerMatch} = ClientUtility.getInput(domElements.input);
  		if(numberOfTeams && teamsPerMatch){
  			tournamentController.startTournament(teamsPerMatch, numberOfTeams);
  		}
  });

});

})();