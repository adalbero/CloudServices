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

function getQuery_old(date) {
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

function getQuery(date) {
	return `SELECT
  		event_date as eventDate,
  		count(distinct user_pseudo_id) as users,
  		cast(sum(params.value.int_value) / 1000 / 60 / 60 as int64) as engagement
		FROM \`app-lid-2c61e.analytics_152387187.events_*\`,
  			UNNEST(event_params) as params
		WHERE event_name = 'user_engagement' AND params.key = 'engagement_time_msec'
			AND event_date >= '${date}'
		GROUP BY event_date ORDER BY 1 desc`
}

const RUN_QUERY = false;

function report(date) {
	var sqlQuery = getQuery(date);

	var options = {
		query: sqlQuery,
		useLegacySql: false
	}

	if (RUN_QUERY) {
		console.log("BigQuery Run...");
		return new Promise(function(resolve, reject) {
			bigquery
				.query(options)
				.then(results => {
					resolve(results[0]);
				})
				.catch(err => {
					reject(err);
				})
			});
	} else {
		return new Promise(function(resolve, reject) {
			resolve(null);
		});
	}
};


