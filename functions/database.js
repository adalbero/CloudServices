'use strict';

const admin = require("firebase-admin");

const serviceAccount = require("./private/mycloud-afg-firebase-adminsdk-tei22-ac2bc17abf.json");

// Initialize the default app
const defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mycloud-afg.firebaseio.com/"
});

function getData(name, callback) {
	const db = defaultApp.database();

	db.goOnline();
	console.log("DB:getData: " + name);
	db.ref(name).once('value').then(function(snapshot) {
		var data = snapshot.val();
		db.goOffline();
		callback(data);
	});
}

module.exports = {
  getData
};
