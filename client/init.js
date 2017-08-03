
(() => {

// Creating all the tournament dependencies
const tournamentModel = new TournamentModel();
const tournamentView =  new TournamentView(tournamentModel);
const requestController = new RequestController();
const tournamentService = new TournamentService(requestController);
const tournamentController = new TournamentController(tournamentModel, tournamentService);

//Binding click event after dom content is loaded;
document.addEventListener('DOMContentLoaded', () => {
  domElements.startButton.addEventListener('click', () => {
  		let {numberOfTeams, teamsPerMatch} = ClientUtility.getInput(domElements.input);
  		tournamentController.startTournament(teamsPerMatch, numberOfTeams);
  });

});

})();