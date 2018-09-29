'use strict';

module.exports = {
	report
}

// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');

// Your Google Cloud Platform project ID
const projectId = 'app-lid-2c61e';

// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
});

function getQuery(date) {
	return `SELECT
		a.event_date,
		a.atcive_users as active_users,
		round(a.engagement_time_sec/60/60) as engagement,
		b.app_install,
		b.app_remove
		FROM \`app-lid-2c61e.com_adalbero_app_lebenindeutchland_ANDROID.vs_user_engagement\` a,
		\`app-lid-2c61e.com_adalbero_app_lebenindeutchland_ANDROID.vs_app_install\` b
		WHERE a.event_date = b.event_date and a.event_date >= '${date}' order by 1`
}

function report(date) {
	var sqlQuery = getQuery(date);

	var options = {
		query: sqlQuery,
		useLegacySql: false
	}

	return new Promise(function(resolve, reject) {
		bigquery
			.query(options)
			.then(results => {
				var rows = results[0];
				resolve(rows);
			})
			.catch(err => {
				reject(err);
			})
		});
};

