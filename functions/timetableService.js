const dateUtil = require('date-and-time');
const dateService = require("./dateService");

const DMYHm = "DD/MM/YYYY HH:mm";	
const DMY = "DD/MM/YYYY";	

module.exports = {
	timetableServiceHandler
}

function timetableServiceHandler(params, database, callback) {
	var result = {
		success: true
	}

	var sFrom = params.from;
	var from = dateUtil.parse(sFrom, DMYHm);
	var nextDay = dateUtil.addDays(from, 1);
	nextDay.setHours(0);
	nextDay.setMinutes(0);

	database.getData('/timetable', function(data) {
		var dateParams = {
			dates: [
				dateUtil.format(from, DMY),
				dateUtil.format(nextDay, DMY)
			]
		};

		dateService.dateServiceHandler(dateParams, database, function(dateResult) {
			try {
				var timetables = getTimetable(data, dateResult);
				var timetable = timetables[0];
				var d = from;

				var time = getNextTime(data, d, params.scope, params.line, params.direction, timetable, params.point);
				if (!time) {
					timetable = timetables[1];
					d = nextDay;
					time = getNextTime(data, d, params.scope, params.line, params.direction, timetable, params.point);
				}

				var busDate = new Date(d);
				busDate.setHours(time / 100);
				busDate.setMinutes(time % 100);

				result.from = dateUtil.format(from, DMYHm);
				result.time = dateUtil.format(busDate, DMYHm);
				result.timetable = timetable.title;

				callback(result);
			} catch (err) {
				result.success = false;
				result.err = err;

				callback(result);
			}
		});
	});
}

function getNextTime(data, from, scopeName, lineName, direction, timetable, point) {
	var scope = data[scopeName];
	if (!scope) throw "Scope not found: " + scopeName;
	
	var lines = scope.lines;
	var line = lines.find(item => item.line == lineName && item.direction == direction);
	if (!line) throw "Line/Direction not found: " + lineName + "/" + direction;

	var times = line[timetable.name][point];
	if (!times) throw "Point not found: " + point;

	var fromTime = from.getHours() * 100 + from.getMinutes();
	var time = times.find(item => item > fromTime);

	return time;
}

function getTimetable(data, dateResult) {
	var result = [];

	var timetables = data.bus_gottingen.timetables;

	dateResult.results.forEach(function(day) {
		var weekday = day.weekday;
		var isHoliday = day.isHoliday;
		var isFerien = day.isFerien;
		var isWeekend = day.isWeekend;

		timetables.forEach(function(timetable) {
			var condition = timetable.condition;
			if (eval(condition)) {
				var record = {
					date: day.date,
					name: timetable.record.name,
					title: timetable.record.title,
				}
				result.push(record);
			}
		});
	});

	return result;
}


