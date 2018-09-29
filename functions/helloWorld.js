exports.handler = function(request, response, database) {
	var params = request.body;
	console.log("params:" + JSON.stringify(params));
	console.log("headers:" + JSON.stringify(request.headers));

	test(params, database, function(result) {
		result.city = request.headers["x-appengine-city"];
		result.
		console.log("result:" + JSON.stringify(result));
		response.send(result);
	});
}

const database = require("./database");

//test();

function test() {
	console.log("BEGIN");
	database.getData('/test', function(data) {
		console.log(data.message);
	});
	console.log("END");
}
