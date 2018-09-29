'use strict';

const geolib = require('geolib');

module.exports = {
  locationServiceHandler
}

function locationServiceHandler(params, store, callback) {
  var result = {
    success: true
  }

  store.getData('/locations', function(data) {
    try {
      if (params.method === "nearBy") {
        params.args.spot = getSpot(data, params.args);
        result.nearBy = params.args;
        result.results = nearBy(data, params.args);
      }
    } catch (err) {
      result.success = false;
      result.err = err;
    }

    callback(result);
  });
}

function getCity(data, spot) {
  var result = null;

  data.cities.forEach(function(city) {
    var dist = geolib.getDistance(spot, city);
    console.log(dist);
    if (dist <= city.radius) {
      result = city;
    }
  });

  return result;
}

function getSpot(data, args) {
  var spot = args.spot;

  if (spot.lat) {
    return spot;
  }

  data.cities.forEach(function(city) {
    if (!args.spot.city || args.spot.city == city.name) {
      city.locations.forEach(function(loc) {
        if (loc.name == spot.name) {
          spot.lat = loc.lat;
          spot.lng = loc.lng;
        }
      });
    }
  });

  if (!spot.lat) throw "Spot not found: " + JSON.stringify(spot);

  return spot;
}

function nearBy(data, args) {
  var results = [];
  
  var spot = args.spot;
  var city = getCity(data, args.spot);

  if (city) {
    var list = geolib.orderByDistance(spot, city.locations);

    list.forEach(function(rec) {
      var item = city.locations[rec.key];
      if (item.type == 'bus_stop') {
        item.distance = rec.distance;
        results.push(item);
      }
    });
  }

  return results;
}