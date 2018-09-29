const functions = require('firebase-functions');
const database = require("./database");

const helloWorld = require("./helloWorld");
const dateService = require("./dateService");
const timetableService = require("./timetableService");
const weatherService = require("./weatherService");
const adSenseService = require("./adSenseService");

exports.helloWorld = functions.https.onRequest((request, response) => {
	helloWorld.handler(request, response, database);
});

exports.dateService = functions.https.onRequest((request, response) => {
	var params = request.body;
	console.log("params:" + JSON.stringify(params));

	dateService.dateServiceHandler(params, database, function(result) {
		console.log("result:" + JSON.stringify(result));
		response.send(result);
	});
});

exports.timetableService = functions.https.onRequest((request, response) => {
	var params = request.body;
	console.log("params:" + JSON.stringify(params));

	timetableService.timetableServiceHandler(params, database, function(result) {
		console.log("result:" + JSON.stringify(result));
		response.send(result);
	});
});

exports.weatherService = functions.https.onRequest((request, response) => {
	var params = request.body;
	console.log("params:" + JSON.stringify(params));

	weatherService.weatherServiceHandler(params, function(result) {
		console.log("result:" + JSON.stringify(result));
		response.send(result);
	});
});

exports.adSenseService = functions.https.onRequest((request, response) => {
	var params = request.body;
	console.log("params:" + JSON.stringify(params));

	adSenseService.adSenseServiceHandler(params, function(result) {
		console.log("result:" + JSON.stringify(result));
		response.send(result);
	});
});

