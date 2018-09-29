const authenticator = require('./myAuthenticator');
const request = require('./myRequestSync');

module.exports = {
	getAccessToken,
	getTodayReport,
	getMonthReport
}

const ACCOUNT_ID = "pub-5723913637413365";

function getAccessToken() {
	return authenticator.getAccessToken('../credentials/adSense_credentials.json');
}

function getTodayReport() {
	var params = {
		startDate:"today-1d",
		endDate: "today",
		dimension: "DATE",
		metric: ["EARNINGS", "IMPRESSIONS", "CLICKS"],
		useTimezoneReporting: "true"
	};

	var result = runAccountReports(ACCOUNT_ID, params);

	var value = {
		yesterday: {
			date: result.rows[0][0],
			earnings: result.rows[0][1],
			impressions: result.rows[0][2],
			clicks: result.rows[0][3]
		},
		today: {
			date: result.rows[1][0],
			earnings: result.rows[1][1],
			impressions: result.rows[1][2],
			clicks: result.rows[1][3]
		}
	};

	value.result = result;
	
	return value;
}

function getMonthReport() {
	var params = {
		startDate:"startOfMonth-1m",
		endDate: "today",
		dimension: "MONTH",
		metric: ["EARNINGS", "IMPRESSIONS", "CLICKS"],
		useTimezoneReporting: "true"
	};

	var result = runAccountReports(ACCOUNT_ID, params);

	var value = {
		lastMonth: {
			date: result.rows[0][0],
			earnings: result.rows[0][1],
			impressions: result.rows[0][2],
			clicks: result.rows[0][3]
		},
		thisMonth: {
			date: result.rows[1][0],
			earnings: result.rows[1][1],
			impressions: result.rows[1][2],
			clicks: result.rows[1][3]
		}
	};

	value.result = result;
	
	return value;
}

function runAccountReports(accountId, params) {
	var url = `https://www.googleapis.com/adsense/v1.4/accounts/${accountId}/reports`;
	var accessToken = getAccessToken();

	var headers = {
		"Authorization": "Bearer " + accessToken
	};

	var result = request.get(url, params, headers);

	return result;	
}
