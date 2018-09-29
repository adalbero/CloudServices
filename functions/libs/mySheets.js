const authenticator = require('./myAuthenticator');
const request = require('./myRequestSync');

module.exports = {
	getAccessToken,
	appendValues,
	getValues,
	clearRange
}

function getAccessToken() {
	var accessToken = authenticator.getAccessToken('../credentials/sheets_credentials.json');
	//console.log(accessToken);
	return accessToken;
}

function appendValues(spreadsheetId, range, values, accessToken) {
	var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
	var accessToken = accessToken || getAccessToken();

	var headers = {
		"Authorization": "Bearer " + accessToken
	};

	var params = {
		values: values
	};

	var result = request.postJson(url, params, headers);

	return result;	
}

function getValues(spreadsheetId, range, accessToken) {
	var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
	var accessToken = accessToken || getAccessToken();

	var headers = {
		"Authorization": "Bearer " + accessToken
	};

	var params = {
	};

	var result = request.get(url, params, headers);

	return result;

}

function clearRange(spreadsheetId, range, accessToken) {
	var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`;
	var accessToken = accessToken || getAccessToken();

	var headers = {
		"Authorization": "Bearer " + accessToken
	};

	var params = {
	};

	var result = request.postJson(url, params, headers);

	return result;

}
