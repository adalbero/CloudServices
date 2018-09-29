const path = require('path');
const fs = require('fs');
const request = require('./myRequestSync');

module.exports = {
	getAccessToken
}

function getAccessToken(credentials) {
	var keyfile = path.join(__dirname, credentials);
	var keys = JSON.parse(fs.readFileSync(keyfile));

	var params = {
		refresh_token: keys.refresh_token,
		client_id: keys.web.client_id,
		client_secret: keys.web.client_secret,
		grant_type: 'refresh_token'
	};

	var url = "https://www.googleapis.com/oauth2/v4/token";

	var response = request.postForm(url, params);
	var token = response.access_token;

	return token;
}
