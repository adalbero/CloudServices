'use strict';

function getData(name, callback) {
	const store = require("./data" + name + ".json");

	callback(store);
}

module.exports = {
  getData
};
