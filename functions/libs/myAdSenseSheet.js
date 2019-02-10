const sheets = require('./mySheets');
const util = require('./myUtils');

module.exports = {
	appendAdSenseValues
}

const spreadsheetId = "1uwcgGDhvWO87Geyvkcq0Gv9qeNSTemBOVjm-wl2nA_E";

const DATE_FORMAT = "DD/MM/YYYY";

const FIELD_SOURCE = 0;
const FIELD_DATE = 1;
const FIELD_HOUR = 2;
const FIELD_EARN = 3;
const FIELD_IMP = 4;
const FIELD_CLICK = 5;
const FIELD_EARN_LAST_D = 6;
const FIELD_EARN_THIS_M = 7;
const FIELD_EARN_LAST_M = 8;
const FIELD_USERS = 9;
const FIELD_ENGAGE = 10;
const FIELD_USERS_LAST = 11;
const FIELD_ENGAGE_LAST = 12;

function main() {
	var adValues = {
		todayReport: {
			today: {
				earnings: 25, 
				impressions: 10000, 
				clicks: 100
			},
			yesterday: {
				earnings: 30
			},
		},
		monthReport: {
			thisMonth: {
				earnings: 250
			},
			lastMonth: {
				earnings: 500
			}
		}
	};

	appendAdSenseValues("TEST", adValues);
}

function appendAdSenseValues(source, adValues) {

	var now = util.getLocalTime();
	// var now = new Date(2018, 9-1, 16, 12, 0);
	var date = util.formatDateTime(now, DATE_FORMAT);
	var hour = now.getHours();

	var values = [
		[
			source, 
			date, 
			hour,
			adValues.todayReport.today.earnings, 
			adValues.todayReport.today.impressions, 
			adValues.todayReport.today.clicks,
			adValues.todayReport.today.users,
			adValues.todayReport.today.engagment,
			adValues.todayReport.yesterday.earnings,
			adValues.monthReport.thisMonth.earnings,
			adValues.monthReport.lastMonth.earnings,
			adValues.todayReport.yesterday.users,
			adValues.todayReport.yesterday.engagment,
		]
	];

	var accessToken = sheets.getAccessToken();

	var updatedRange = appendValues(values, accessToken);
	var previousRange = getPreviousRange(updatedRange)

	var previousValues = getValues(previousRange, accessToken);

	var newValues = getNewValues(previousValues, values, now);

	if (newValues) {
		clearValues(updatedRange, accessToken);
		appendValues(newValues, accessToken);
	}

}

function getNewValues(lastValues, thisValues, now) {
	var lastRecord = {
		source: lastValues[0][FIELD_SOURCE],
		date: lastValues[0][FIELD_DATE],
		hour: lastValues[0][FIELD_HOUR]*1,
		values: [
			lastValues[0][FIELD_EARN]*1,
			lastValues[0][FIELD_IMP]*1,
			lastValues[0][FIELD_CLICK]*1,
			lastValues[0][FIELD_USERS]*1,
			lastValues[0][FIELD_ENGAGE]*1,
		],
		lastDay: lastValues[0][FIELD_EARN_LAST_D],
		thisMonth: lastValues[0][FIELD_EARN_THIS_M],
		lastMonth: lastValues[0][FIELD_EARN_LAST_M],
		lastUsers: lastValues[0][FIELD_USERS_LAST],
		lastEngagment: lastValues[0][FIELD_ENGAGE_LAST]

	}

	var thisRecord = {
		source: thisValues[0][FIELD_SOURCE],
		date: thisValues[0][FIELD_DATE],
		hour: now.getHours() + now.getMinutes() / 60.0,
		values: [
			thisValues[0][FIELD_EARN],
			thisValues[0][FIELD_IMP],
			thisValues[0][FIELD_CLICK],
			thisValues[0][FIELD_USERS],
			thisValues[0][FIELD_ENGAGE]
		],
		lastDay: thisValues[0][FIELD_EARN_LAST_D],
		thisMonth: thisValues[0][FIELD_EARN_THIS_M],
		lastMonth: thisValues[0][FIELD_EARN_LAST_M],
		lastUsers: thisValues[0][FIELD_USERS_LAST],
		lastEngagment: thisValues[0][FIELD_ENGAGE_LAST]

	}

	if (thisRecord.date == lastRecord.date && thisRecord.hour == lastRecord.hour + 1) {
		console.log("up to date");
		return null;
	}

	var thisDate = util.parseDateTime(thisRecord.date, DATE_FORMAT);
	var lastDate = util.parseDateTime(lastRecord.date, DATE_FORMAT);
	var days = util.diffDays(thisDate, lastDate);

	if (days > 1) {
		console.log(`${days} days. Too late.`);
		return null;
	}

	var values = [];

	if (days == 1) {
		endRecord = {
			source: thisRecord.source,
			date: lastRecord.date,
			hour: 24,
			values: [
				thisRecord.lastDay,
				0,
				0,
				thisRecord.lastUsers,
				thisRecord.lastEngagment
			],
			lastDay: thisValues.lastDay,
			thisMonth: thisValues.thisMonth,
			lastMonth: thisValues.lastMonth,
			lastUsers: thisValues.lastUsers,
			lastEngagment: thisValues.lastEngagment,
		}

		fillGap(values, lastRecord, endRecord);

		lastRecord = {
			source: thisRecord.source,
			date: thisRecord.date,
			hour: 0,
			values: [
				0,
				0,
				0,
				0,
				0
			],
			lastDay: thisValues.lastDay,
			thisMonth: thisValues.thisMonth,
			lastMonth: thisValues.lastMonth,
			lastUsers: thisValues.lastUsers,
			lastEngagment: thisValues.lastEngagment

		}

	}

	fillGap(values, lastRecord, thisRecord);

	return values;
}

function fillGap(values, lastRecord, thisRecord) {
	var thisHours = thisRecord.hour;
	var lastHours = lastRecord.hour;
	var diffHours = thisHours - lastHours;

	for (var i=1; i<=diffHours; i++) {
		var h = lastRecord.hour + i;
		var row = [thisRecord.source, thisRecord.date, h];
		for (var j=0; j<thisRecord.values.length; j++) {
			var v = "";
			var thisV = thisRecord.values[j];
			var lastV = lastRecord.values[j];
			var factor = (thisV - lastV) / diffHours;
			var v = lastV + i*factor;
			if (j > 0) {
				v = Math.round(v);
			} else {
				v = Math.round(v*100)/100;
			}
			row.push(v);
		}
		row.push(thisRecord.lastDay);
		row.push(thisRecord.thisMonth);
		row.push(thisRecord.lastMonth);
		row.push(thisRecord.lastUsers);
		row.push(thisRecord.lastEngagment);
		values.push(row);
	}
}

function parseDate(input) {
	var parts = input.split('/');
	return new Date(parts[2], parts[1]-1, parts[1]);
}

function appendValues(values, accessToken) {
	var range = "Data!A1";
	var result = sheets.appendValues(spreadsheetId, range, values, accessToken);	

	return result.updates.updatedRange;
}

function getValues(range, accessToken) {
	var result = sheets.getValues(spreadsheetId, range, accessToken);	

	return result.values;
}

function clearValues(range, accessToken) {
	var result = sheets.clearRange(spreadsheetId, range, accessToken);	

	return result.clearedRange;
}

function getPreviousRange(range) {
  var row = range.match(/(\d+)/g)[0];
  var previousRange = range.replace(/(\d+)/g, (row-1));

  return previousRange;
}


