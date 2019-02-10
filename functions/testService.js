const database = require("./database");
const localStore = require("./localStore");

const timetableService = require("./timetableService");
const dateService = require("./dateService");
const functionService = require("./functionService");
const locationService = require("./locationService");
const weatherService = require("./weatherService");
const adSenseService = require("./adSenseService");

//timetableServiceTest();
//dateServiceTest();
//functionServiceTest();
//locationServiceTest();
//syncRequestTest();
//weatherServiceTest();
adSenseServiceTest();

function weatherServiceTest() {
	console.log("weatherServiceTest");

	var params = {
		netatmo: true,
		open_weather: true,
		wunderground: true,
		merge: true
	};
	
	console.log("BEGIN");
	weatherService.weatherServiceHandler(params, function(result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}

function dateServiceTest() {
	console.log("dateServiceTest");

	const params = {
		date: "25/12/2017"
		//date: ["01/01/2018", "02/01/2018"]
		//date: ["01/01/2018 12:30", "02/01/2018"]
	};

	console.log("BEGIN");
	dateService.dateServiceHandler(params, localStore, function(result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}

function homeWeatherTest() {
	console.log("homeWeatherTest");

	console.log("BEGIN");
	
	var result = weatherService.getHomeWeather();
	console.log(result);

	console.log("END");
}

function syncRequestTest() {
	console.log("syncRequestTest");

	const params = {
		from: "03/01/2018 18:00",
		scope: "bus_gottingen",
		line: "50", 
		direction: "Bahnhof", 
		point: "Rohns"
	};

	console.log("BEGIN");
	var result = functionService.call("timetableService", params);

	console.log(result);
	console.log("END");
}

function locationServiceTest() {
	console.log("locationServiceTest");

	const params = {
		method: "nearBy",
		args: {
			spot:
				{
					"city": "Göttingen",
					"name": "School"
				}
			}
	};

	console.log("BEGIN");
	locationService.locationServiceHandler(params, localStore, function(result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}

function functionServiceTest() {
	console.log("functionServiceTest");

	const params = {
		dates: ["25/12/2017"]
	};

	console.log("BEGIN");
	functionService.call("dateService", params, function(err, result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}

function timetableServiceTest() {
	console.log("timetableServiceTest");

	const params = {
		from: "26/12/2017 22:00",
		scope: "bus_gottingen",
		line: "50", 
		direction: "Bahnhof", 
		point: "Rohns"
	};

	console.log("BEGIN");
	timetableService.timetableServiceHandler(params, database, function(result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}

function adSenseServiceTest() {
	console.log("adSenseServiceTest");

	const params = {
		source: "TEST",
		command: "excel"
	};

	console.log("BEGIN");
	adSenseService.adSenseServiceHandler(params, function(result) {
		console.log("params: " + JSON.stringify(params, null, '\t'));
		console.log("result: " + JSON.stringify(result, null, '\t'));
		console.log("END");
	});
}