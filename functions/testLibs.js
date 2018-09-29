const util = require('./libs/myUtils');
const adSense = require('./libs/myAdSense');
const sheets = require('./libs/mySheets');
const querystring = require('querystring');

function test1() {
	console.log("BEGIN");

	const spreadsheetId = "1YoqIhMAjCgISIuX7ggxKCFjHxELzLpiJ0-zY91Ul5Gk";
	
	var source = "test";
	var date = util.formatDateTime(util.getLocalTime());
	var value = adSense.getTodayReport();

	var values = [
		[source, date, value.today.earnings, value.today.impressions, value.today.clicks]
	];
	console.log(values);

	// var range = "Hour!A1";

	// var result = sheets.runAppend(spreadsheetId, range, values);
	console.log("END");
}

function test2() {
	console.log("Bearer " + adSense.getToken());
}

function test3() {
	var params = {
		name: "abc",
		key: ["123", "456"]
	};

	console.log(querystring.stringify(params));
}

test1();