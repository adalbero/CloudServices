const util = require('./libs/myUtils');
const adSense = require('./libs/myAdSense');
const sheets = require('./libs/mySheets');
const adSenseSheet = require('./libs/myAdSenseSheet');

module.exports = {
	adSenseServiceHandler
}

const spreadsheetId = "1YoqIhMAjCgISIuX7ggxKCFjHxELzLpiJ0-zY91Ul5Gk";

function adSenseServiceHandler(params, callback) {
	var result = {
		success: true,
		version: "1.1",
		source: params.source
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
		try {
			var value = {
				todayReport: adSense.getTodayReport(),
				monthReport: adSense.getMonthReport()
			}

			value.timestamp = timestamp;

			//appendValues(params.source, value);
			adSenseSheet.appendAdSenseValues(params.source, value);

			result.value = value;
		} catch (ex) {
			console.log("Err at append");
			result.success = false;
			result.error = ex;
		}
	}

	callback(result);
}

function appendValues(source, adSenseValue) {
	var now = util.getLocalTime();
	var values = [];

	if (now.getHours() == 1) {
		values = [
			[source, 
			adSenseValue.todayReport.yesterday.date + " 23:59", 
			adSenseValue.todayReport.yesterday.earnings, 
			adSenseValue.todayReport.yesterday.impressions, 
			adSenseValue.todayReport.yesterday.clicks]
		];
		sheets.runAppend(spreadsheetId, "Hour!A1", values);
	}

	values = [
		[source, 
		adSenseValue.timestamp, 
		adSenseValue.todayReport.today.earnings, 
		adSenseValue.todayReport.today.impressions, 
		adSenseValue.todayReport.today.clicks,
		adSenseValue.todayReport.yesterday.earnings,
		adSenseValue.monthReport.thisMonth.earnings,
		adSenseValue.monthReport.lastMonth.earnings]
	];

	sheets.appendValues(spreadsheetId, "Hour!A1", values);

}


