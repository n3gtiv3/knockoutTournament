
const domElements = {
	input : {
		teamsPerMatch : document.getElementById("teamsPerMatch"),
		numberOfTeams : document.getElementById("numberOfTeams")
	},
	startButton : document.getElementById("start"),
	loader      : document.getElementById("loader"),
	tournamentProgress : {
		progress : document.getElementById("tournamentProgress"),
		matches : document.querySelector(".bar"),
		match : document.querySelector(".tile")
	},
	messageElem : document.getElementById("messageElem"),
	winnerElem  : document.getElementById("winner"),
	mainView    : document.getElementById("mainView"),
	cocGif      : document.getElementById("coc"),
	bootUpAudio : document.getElementById("bootUpAudio"),
	mainThemeAudio : document.getElementById("mainThemeAudio"),
	winnerAudio : document.getElementById("winnerAudio")
}

