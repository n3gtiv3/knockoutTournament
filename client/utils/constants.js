const EVENTLISTENER = {
	CONDUCT_MATCH 	   : "CONDUCT_MATCH",
	TOURNAMENT_INITIATED  : "TOURNAMENT_STARTS",
	TOURNAMENT_CREATED : "TOURNAMENT_CREATED",
	MATCH_STARTS       : "MATCH_STARTS",
	MATCH_END          : "MATCH_END",
	TOURNAMENT_ENDS    : "TOURNAMENT_ENDS",
	ERROR 			   : "ERROR",
	RESET              : "RESET"
}

const TOURNAMENT = {
	FIRST_ROUND : 0,
	MAX_REQUEST : 8
}
const REQUEST_TYPE = {
	GET : "GET",
	POST: "POST"
}
const API_URL = {
	TOURNAMENT : "/tournament",
	TEAM       : "/team",
	MATCH      : "/match",
	WINNER     : "/winner"
}
const MESSAGES = {
	DEFAULT_ERROR_MESSAGE :  "Something went wrong!",
	TOURNAMENT_CREATED    :  "Tournament Created with Id ",
}
const ERROR_MESSAGE = {
	INVALID_TEAMS_PER_MATCH : "Please provide valid number of teams per match",
	INVALID_NUMBER_OF_TEAMS : "Please provide valid number of teams "
}
const ERROR = {
	CREATING_TOURNAMENT : "CREATING_TOURNAMENT",
	GETTING_TEAM_SCORES : "GETTING_TEAM_SCORES",
	GETTING_MATCH_SCORE : "MATCH_SCORE",
	GETTING_WINNER : "GETTING_WINNER"
}