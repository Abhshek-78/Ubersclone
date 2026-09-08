const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');

const mapService = require('../services/map.service');

const originalGet = axios.get;
const originalPost = axios.post;

process.env.MAPBOX_API = 'test-mapbox-token';

test('getAddressCoordinate uses Mapbox geocoding and returns latitude/longitude', async () => {
  axios.get = async (url, config) => {
    assert.match(url, /api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\//);
    assert.equal(config.params.access_token, 'test-mapbox-token');
    return {
      data: {
        features: [{ center: [-73.935242, 40.73061], place_name: 'New York, New York, United States' }],
      },
    };
  };

  const result = await mapService.getAddressCoordinate('New York');
  assert.deepEqual(result, { latitude: 40.73061, longitude: -73.935242 });

  axios.get = originalGet;
});

test('getDistancetime uses Mapbox directions and returns distance/duration data', async () => {
  let callCount = 0;

  axios.get = async (url, config) => {
    callCount += 1;

    if (callCount === 1) {
      assert.match(url, /api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/Bhopal\.json/);
      assert.equal(config.params.access_token, 'test-mapbox-token');
      return {
        data: {
          features: [{ center: [77.4126, 23.2599] }],
        },
      };
    }

    if (callCount === 2) {
      assert.match(url, /api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/Indore\.json/);
      assert.equal(config.params.access_token, 'test-mapbox-token');
      return {
        data: {
          features: [{ center: [75.8577, 22.7196] }],
        },
      };
    }

    assert.match(url, /api\.mapbox\.com\/directions\/v5\/mapbox\/driving\//);
    assert.equal(config.params.access_token, 'test-mapbox-token');
    return {
      data: {
        routes: [{ distance: 12000, duration: 900 }],
      },
    };
  };

  const result = await mapService.getDistancetime('Bhopal', 'Indore');
  assert.equal(result.distance.value, 12000);
  assert.equal(result.duration.value, 900);

  axios.get = originalGet;
});

test.after(() => {
  axios.get = originalGet;
  axios.post = originalPost;
});
