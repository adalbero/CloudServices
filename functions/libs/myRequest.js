'use strict';

const request = require('request');

module.exports = {
	get,
	postForm,
	postJson
}

function get(url, params, headers) {

}

function setContentType(headers, contentType) {
	headers = Object.assign({}, headers, {
		"Content-Type": contentType
	});

	return headers;
}
