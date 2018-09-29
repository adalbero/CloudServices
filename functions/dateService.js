const dateUtil = require('date-and-time');

const FMT = "DD/MM/YYYY";	
const WEEKEND = ["Saturday", "Sunday"];

module.exports = {
	dateServiceHandler
}

function dateServiceHandler(params, store, callback) {
	var result = {}

	store.getData('/dateInfo', function(dateInfo) {
		result.results = [];

		try {
			if (!params.date) {
				throw "No 'date' param.";
			} else if (params.date instanceof Array) {
				for (var i=0; i<params.date.length; i++) {
					process(params.date[i], dateInfo, result);
				}
			} else {
				process(params.date, dateInfo, result);
			}

			callback(result);
		} catch (err) {
			result.err = err;
			result.results = undefined;
			
			usage(result);

			callback(result);
		}

	});
}

function process(sDate, dateInfo, result) {
	var record = {};

	record.date = sDate;

    var date = dateUtil.parse(sDate, FMT);
    if (date) {
		var holiday = dateInfo.holidays.find(item => item.date == sDate);
		var sommerferien = dateInfo.sommerferien.find(item => between(date, item.start, item.end));
		var sommertime = dateInfo.sommertime.find(item => between(date, item.start, item.end));

		record.weekday = dateUtil.format(date, "dddd");
		record.isWeekend = (WEEKEND.indexOf(record.weekDay) >= 0);
		record.holidayName = (holiday ? holiday.name : "");
		record.isHoliday = (holiday ? true : false);
		record.isSommerferien = (sommerferien ? true : false);
		record.isSommertime = (sommertime ? true : false);
    } else {
    	record.err = "Date not in correct format (DD/MM/YYYY)";
    }

	result.results.push(record);
}

function between(date, sStart, sEnd) {
    var start = dateUtil.parse(sStart, FMT);
    var end = dateUtil.parse(sEnd, FMT);
    end = dateUtil.addDays(end, 1);

    return date >= start && date <= end;
}

function usage(result) {
	result.usage = {
		reqeust: {
			"#": "single value or array",
			date: ["01/01/2018", "02/01/2018"]
		},
		response: {
			results: [
				{
					date: "25/12/2017",
					weekday: "Monday",
					isWeekend: false,
					holidayName: "Christmas Day",
					isHoliday: true,
					isSommerferien: false,
					isSommertime: false
				}
			],
			"#": "err if not sucess",
			err: "message"
		}
	}
}

