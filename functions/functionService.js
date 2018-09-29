'use strict';

const request = require('request');
const srequest = require('sync-request');

const URL = "https://us-central1-digital-rhythm-156015.cloudfunctions.net/";

module.exports = {
  call,
  post
}

function call(name, params, callback) {
  var url = URL + name;

  if (callback) {

    var options = {
      method: 'post',
      body: params,
      json: true,
      url: URL + name
    };

    request(options, function (err, res, body) {
      return callback(err, body);
    });

  } else {

    var res = srequest('POST', url, {
      'json': params
    });

    var result = JSON.parse(res.body);

    return result;

  }

  return null;
};

function post(url, params) {
    var res = srequest('POST', url, {
      'json': params
    });

    var result = JSON.parse(res.body);

    return result;
}

