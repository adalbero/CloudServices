const srequest = require('sync-request');
const querystring = require('querystring');

module.exports = {
	get,
	postForm,
	postJson
}

function get(url, params, headers) {
	var qs = querystring.stringify(params);
	url = url + "?" + qs;

	headers = setContentType(headers, "application/json");

	var options = {
		qs: null,
		headers: headers
	};

	var res = srequest('get', url, options);
	if (res.statusCode != 200) {
		throw res.body.toString();
	}

	var result = JSON.parse(res.body);

	return result;
};

function postForm(url, params, headers) {
	headers = setContentType(headers, "application/x-www-form-urlencoded");

	var options = {
		body: querystring.stringify(params),
		headers: headers
	};

	var res = srequest('post', url, options);
	if (res.statusCode != 200) {
		throw res.body.toString();
	}

	var result = JSON.parse(res.body);

	return result;
};

function postJson(url, params, headers) {
	headers = setContentType(headers, "application/json");

	var options = {
		json: params,
		headers: headers
	};

	var res = srequest('post', url, options);
	if (res.statusCode != 200) {
		throw res.body.toString();
	}

	var result = JSON.parse(res.body);

	return result;
};

function setContentType(headers, contentType) {
	headers = Object.assign({}, headers, {
		"Content-Type": contentType
	});

	return headers;
}

