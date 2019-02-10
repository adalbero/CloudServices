const bigQuery = require('./libs/myBigQuery');

function main() {
	console.log("BEGIN");
	bigQuery.report('20190201').then(result => {
		console.log("result");
		console.log(result);
	})
	console.log("END");
}

main();
