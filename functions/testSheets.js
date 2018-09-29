const sheets = require('./libs/mySheets');
const util = require('./libs/myUtils');

module.exports = {
	append
}

const spreadsheetId = "1YoqIhMAjCgISIuX7ggxKCFjHxELzLpiJ0-zY91Ul5Gk";

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

function main() {
	var values = [
		["TEST", 
		"today", 
		25, 
		456, 
		789,
		30,
		250,
		500]
	];

	append(values);
}

function append(adValues) {

	var now = util.getLocalTime();
	//var now = new Date(2018, 9-1, 16, 1, 0);
	var date = util.formatDateTime(now, DATE_FORMAT);
	var hours = now.getHours();

	var values = [
		[adValues[0][0], date, hours]
	];
	for (var i=2; i<8; i++) {
		values[0].push(adValues[0][i]);
	}

	// console.log("values");
	// console.log(values);

	var accessToken = sheets.getAccessToken();

	var updatedRange = appendValues(values, accessToken);
	var previousRange = getPreviousRange(updatedRange)

	var previousValues = getValues(previousRange, accessToken);
	// console.log("previousValues");
	// console.log(previousValues);

	var newValues = getNewValues(previousValues, values, now);
	// console.log("newValues");
	// console.log(newValues);

	if (newValues) {
		var clearedRange = clearValues(updatedRange, accessToken);

		var newRange = appendValues(newValues, accessToken);
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
			lastValues[0][FIELD_CLICK]*1
		]
	}

	// console.log(lastRecord);

	var thisRecord = {
		source: thisValues[0][FIELD_SOURCE],
		date: thisValues[0][FIELD_DATE],
		hour: now.getHours() + now.getMinutes() / 60.0,
		values: [
			thisValues[0][FIELD_EARN],
			thisValues[0][FIELD_IMP],
			thisValues[0][FIELD_CLICK]
		],
		lastDay: thisValues[0][FIELD_EARN_LAST_D],
		lastMonth: thisValues[0][FIELD_EARN_THIS_M],
		thisMonth: thisValues[0][FIELD_EARN_LAST_M]
	}
	// console.log(thisRecord);

	if (thisRecord.date == lastRecord.date && thisRecord.hour == lastRecord.hour + 1) {
		return null;
	}

	var thisDate = util.parseDateTime(thisRecord.date, DATE_FORMAT);
	var lastDate = util.parseDateTime(lastRecord.date, DATE_FORMAT);
	var days = util.diffDays(thisDate, lastDate);

	if (days > 1) {
		console.log(days);
		console.log("too late.");
		return null;
	}

	var values = [];

	if (days == 1) {
		endRecord = {
			source: thisRecord.source,
			date: lastRecord.date,
			hour: 24,
			values: [
				thisRecord.lastDay
			]
		}

		fillGap(values, lastRecord, endRecord);

		lastRecord = {
			source: thisRecord.source,
			date: thisRecord.date,
			hour: 0,
			values: [
				0
			]
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
			if (j < lastRecord.values.length) {
				var thisV = thisRecord.values[j];
				var lastV = lastRecord.values[j];
				var factor = (thisV - lastV) / diffHours;
				var v = lastV + i*factor;
				if (j > 0) {
					v = Math.round(v);
				} else {
					v = Math.round(v*100)/100;
				}
			}
			row.push(v);
		}
		row.push(thisRecord.lastDay || "");
		row.push(thisRecord.thisMonth || "");
		row.push(thisRecord.lastMonth || "");
		values.push(row);
	}
}

function parseDate(input) {
	var parts = input.split('/');
	return new Date(parts[2], parts[1]-1, parts[1]);
}

function appendValues(values, accessToken) {
	var range = "Test!A1";
	var result = sheets.runAppend(spreadsheetId, range, values, accessToken);	

	return result.updates.updatedRange;
}

function getValues(range, accessToken) {
	var result = sheets.getValues(spreadsheetId, range, accessToken);	

	return result.values;
}

function clearValues(range, accessToken) {
	var result = sheets.runClear(spreadsheetId, range, accessToken);	

	return result.clearedRange;
}

function getPreviousRange(range) {
  var row = range.match(/(\d+)/g)[0];
  var previousRange = range.replace(/(\d+)/g, (row-1));

  return(previousRange);
}

//main();

