const util = require('./libs/myUtils');
const adSense = require('./libs/myAdSense');
const sheets = require('./libs/mySheets');
const adSenseSheet = require('./libs/myAdSenseSheet');
const bigQuery = require('./libs/myBigQuery');

module.exports = {
	adSenseServiceHandler
}

const spreadsheetId = "1YoqIhMAjCgISIuX7ggxKCFjHxELzLpiJ0-zY91Ul5Gk";

function adSenseServiceHandler(params, callback) {
	var result = {
		success: true,
		version: "1.2",
		source: params.source,
		value: {}
	}

	var now = util.getLocalTime();
	var timestamp = util.formatDateTime(now, "YYYY-MM-DD HH:mm");
	result.timestamp = timestamp;

	if (params.command == "echo") {
		console.log("echo");
		var value = params;
		result.value = value;
	} else if (params.command == "today") {
		console.log("today");
		try {
			var value = adSense.getTodayReport();
			result.value = value;
		} catch (ex) {
			result.success = false;
			result.error = JSON.parse(ex);
		}
	} else if (params.command == "month") {
		console.log("month");
		try {
			var value = adSense.getMonthReport();
			result.value = value;
		} catch (ex) {
			result.success = false;
			result.error = JSON.parse(ex);
		}
	} else {
		console.log("Default: append");
		
		runAdSenseReport(result);
		runUserReport(result, callback);
		return;
	}

	callback(result);
}

function runAdSenseReport(result) {
	console.log("adSense Report...");

	try {
		result.value.timestamp = result.timestamp;

		result.value.todayReport = adSense.getTodayReport();
		result.value.monthReport = adSense.getMonthReport();

		console.log("adSense Report. END");

	} catch (ex) {
		console.log("Err at adSense report");
		result.success = false;
		result.error = ex;
	}

}

function runUserReport(result, callback) {
	console.log("User Report...");

	var now = util.getYesterday();
	var yesterday = util.formatDateTime(now, "YYYYMMDD");

	bigQuery.report(yesterday)
		.then(res => {
			if (res) {
				result.value.todayReport.today.users = res[0].users;
				result.value.todayReport.today.engagment = res[0].engagement;
				result.value.todayReport.yesterday.users = res[1].users;
				result.value.todayReport.yesterday.engagment = res[1].engagement;
			} else {
				result.value.todayReport.today.users = 0;
				result.value.todayReport.today.engagment = 0;
				result.value.todayReport.yesterday.users = 0;
				result.value.todayReport.yesterday.engagment = 0;
			}

			console.log("User Report. END");

			appendValues(result, callback);
		})
		.catch(ex => {
			console.log("Err at User report");
			result.success = false;
			result.error = ex;

			callback(result);
		});
}

function appendValues(result, callback) {
	console.log("appendValues...");

	try {

		adSenseSheet.appendAdSenseValues(result.source, result.value);
		console.log("appendValues. END");

	} catch (ex) {
		console.log("Err at append");
		result.success = false;
		result.error = ex;
	}

	callback(result);
}