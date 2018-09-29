'use strict';

var https = require("https");
const querystring = require('querystring');
const srequest = require('sync-request');
const dateUtil = require('date-and-time');

const POST = 'post';
const GET = 'get';

const DEVICE_ID = '70:ee:50:19:42:0e';
const MODULE_ID = '02:00:00:19:07:22';

module.exports = {
  weatherServiceHandler
}

function weatherServiceHandler(params, callback) {
  var result = {}

  try {
    if (params.netatmo) getNetatmoWeather(params, result);
    if (params.open_weather) getOpenWeather(params, result);
    if (params.wunderground) getWunderground(params, result);

    if (params.merge) {
      doMerge(result);
      result.netatmo = undefined;
      result.open_weather = undefined;
      result.wunderground = undefined;
    }

    if (Object.keys(result).length === 0) throw "Request Usage:";
  } catch (err) {
    result.err = err;

    usage(result);
  }

  callback(result);
}

function getNetatmoWeather(params, result) {
  var stationData = getNetatmoStationsData();

  var device = stationData.body.devices[0];
  var module = device.modules[0];

  result.netatmo = {};
  result.netatmo.indoor = formatNetatmo(device.dashboard_data);
  result.netatmo.weather = formatNetatmo(module.dashboard_data);
}

function getNetatmoStationsData(token) {
  if (!token) {
    token = getNetatmoToken();
  }

  var params = {
    access_token: token.access_token,
    device_id: DEVICE_ID
  };

  var stationsData = callNetatmo("api/getstationsdata", params);

  return stationsData;
}

function getNetatmoToken() {
  var params = 
    {
      grant_type: "password",
      username: "adalbero@gmail.com",
      password: "irinA100",
      client_id:"5a4e062011349fab908b4d22",
      client_secret: "227DQm8mRFTssJCtnir49xlUve"
    };


  var token = callNetatmo("oauth2/token", params);

  return token;
};

function callNetatmo(method, params) {
  var qs = querystring.stringify(params);

  var options = {
    body: qs,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var url = "https://api.netatmo.com/" + method;

  var res = srequest(POST, url, options)
  var result = JSON.parse(res.body);

  return result;
};


function getOpenWeather(params, result) {
  var options = {
    units: "metric",
    id: "2918632"
  };

  result.open_weather = {};

  var weather = callOpenWeather("weather", options);
  result.open_weather.weather = formatOpenWeather(weather);

  var forecast = callOpenWeather("forecast", options);
  result.open_weather.forecast = [];
  for (var i=0; i<forecast.list.length && i<8; i++) {
    var record = forecast.list[i];
    var res = formatOpenWeather(record);
    result.open_weather.forecast.push(res);
  }
}

function callOpenWeather(method, options) {
  options.APPID = "bf0cafca330137fc826ab4e97352b581";
  var qs = querystring.stringify(options);
  var url = "https://api.openweathermap.org/data/2.5/" + method + "?" + qs;

  var res = srequest(GET, url)
  var result = JSON.parse(res.body);

  return result;
};

function getWunderground(params, result) {
  const country = "Germany";
  const city = "Göttingen";

  result.wunderground = {};

  var conditions = callWunderground("conditions", country, city);
  result.wunderground.weather = formatWundergroundConditions(conditions.current_observation);

  var hourly = callWunderground("hourly", country, city);
  result.wunderground.forecast = []
  for (var i=0; i<hourly.hourly_forecast.length; i++) {
    var record = hourly.hourly_forecast[i];
    var res = formatWundergroundHourly(record);
    result.wunderground.forecast.push(res);
  }
}

function callWunderground(method, country, city) {
  const key = "3280bf95786ead21";
  city = querystring.escape(city);

  var url = "http://api.wunderground.com/api/" + key + "/" + method + "/q/" + city + ".json";

  var res = srequest(GET, url)
  var result = JSON.parse(res.body);

  return result;
};

function formatDate(timestamp) {
  const FMT = "DD/MM/YYYY HH:mm:ss";
  return dateUtil.format(new Date(timestamp*1000), FMT);
}

function getCardinal(deg) {
  const cardinal = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  var n = cardinal.length;
  var step = 360 / n;
  var offset = step / 2;
  var idx = ( (deg + offset) / step) | 0;

  return cardinal[idx % n];
}

function usage(result) {
  result.usage = {
    request: {
      netatmo: true,
      open_weather: true,
      wunderground: true
    }
  }
}

function formatNetatmo(record) {
  var res = {
    time: formatDate(record.time_utc),

    temp: record.Temperature,
    temp_trend: record.temp_trend,
    temp_like: undefined,
    temp_min: record.min_temp,
    temp_max: record.max_temp,
    temp_min_time: formatDate(record.date_min_temp),
    temp_max_time: formatDate(record.date_max_temp),
    
    humidity: record.Humidity,

    pressure: record.AbsolutePressure,
    pressure_trend: record.pressure_trend,

    wind_speed: undefined,
    wind_dir: undefined,

    weather: undefined,
    weather_icon: undefined,
    weather_icon_url: undefined,

    visibility: undefined,

    rain_volume: undefined,
    rain_chance: undefined,

    snow_volume: undefined,
  };

  return res;
}

function formatOpenWeather(record) {
  var ret = {
    time: formatDate(record.dt),

    temp: record.main.temp,
    temp_trend: undefined,
    temp_like: undefined,
    temp_min: undefined,
    temp_max: undefined,
    temp_min_time: undefined,
    temp_max_time: undefined,

    humidity: record.main.humidity,

    pressure: undefined,
    pressure_trend: undefined,

    wind_speed: record.wind.speed * 3.6,
    wind_dir: getCardinal(record.wind.deg),

    weather: record.weather[0].description,
    weather_icon: record.weather[0].icon,
    weather_icon_url: "http://openweathermap.org/img/w/" + record.weather[0].icon + ".png",

    visibility: undefined,

    rain_volume: undefined,
    rain_chance: undefined,

    snow_volume: undefined,
    
    extra_cloudiness: record.clouds.all
  };

  if (record.rain) ret.rain_volume = record.rain["3h"];
  if (record.snow) ret.snow_volume = record.snow["3h"];

  return ret;
}

function formatWundergroundConditions(record) {
  var ret = {
    time: formatDate(record.observation_epoch),

    temp: record.temp_c,
    temp_trend: undefined,
    temp_like: record.feelslike_c,
    temp_min: undefined,
    temp_max: undefined,
    temp_min_time: undefined,
    temp_max_time: undefined,

    humidity: record.relative_humidity,

    pressure: undefined,
    pressure_trend: record.pressure_trend,

    wind_speed: record.wind_kph,
    wind_dir: getCardinal(record.wind_degrees),

    weather: record.weather,
    weather_icon: record.icon,
    weather_icon_url: record.icon_url,

    visibility: record.visibility_km,

    rain_volume: record.precip_today_metric,
    rain_chance: undefined,

    snow_volume: undefined
  };

  return ret;
}

function formatWundergroundHourly(record) {
  var ret = {
    time: formatDate(record.FCTTIME.epoch),

    temp: record.temp.metric,
    temp_trend: undefined,
    temp_like: record.feelslike.metric,
    temp_min: undefined,
    temp_max: undefined,
    temp_min_time: undefined,
    temp_max_time: undefined,

    humidity: record.humidity,

    pressure: undefined,
    pressure_trend: undefined,

    wind_speed: record.wspd.metric,
    wind_dir: getCardinal(record.wspd.degrees),

    weather: record.weather,
    weather_icon: record.icon,
    weather_icon_url: record.icon_url,

    visibility: record.visibility_km,

    rain_volume: undefined,
    rain_chance: record.pop,

    snow_volume: undefined

  };

  return ret;
}

function doMerge(result) {
  result.merge = {};

  result.merge.weather = {};

  var keys = ["time", "temp", "temp_like",   
    "humidity",  "pressure",  
    "wind_speed",  "wind_dir",  
    "weather",  "weather_icon",  "weather_icon_url",  
    "visibility"];

  for (var i=0; i<keys.length; i++) {
    mergeWeather(result, keys[i]);
  }

}

function mergeWeather(result, key) {
  var na = result.netatmo ? result.netatmo.weather ? result.netatmo.weather[key] : undefined : undefined;
  var ow = result.open_weather ? result.open_weather.weather ? result.open_weather.weather[key] : undefined : undefined;
  var wu = result.wunderground ? result.wunderground.weather ? result.wunderground.weather[key] : undefined : undefined;

  result.merge.weather[key] = {
    na: na,
    ow: ow,
    wu: wu
  };
}

