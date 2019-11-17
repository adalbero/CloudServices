const datetime = require('date-and-time');

const LOCAL_OFFSET = 1; // 1=Standard time, 2=Summer time

module.exports = {
	getLocalTime,
	getYesterday,
	formatDateTime,
	parseDateTime,
	diffDays
}

function getLocalTime() {
	var now = new Date();
	var timezoneOffset = now.getTimezoneOffset() / 60;
	now = datetime.addHours(now, timezoneOffset);
	now = datetime.addHours(now, LOCAL_OFFSET);

	return now;
}

function getYesterday() {
	var yesterday = getLocalTime();
	yesterday = datetime.addDays(yesterday, -1);

	return yesterday;
}

function diffDays(d1, d2) {
	return datetime.subtract(d1, d2).toDays();
}

function formatDateTime(date, format) {
	var str = datetime.format(date, format);

	return str;
}

function parseDateTime(str, format) {
	var d = datetime.parse(str, format);

	return d;
}
