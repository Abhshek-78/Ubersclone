const express = require('express');
const router = express.Router();
const mapController = require('../controllers/maps.controller');
const { query } = require('express-validator');

router.get(
    '/getCoordinates',
    query('address').isString().isLength({ min: 3 }),
    mapController.getCoordinates
);

router.get('/get-address', mapController.getAddressFromCoordinates);

router.get(
    '/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    mapController.getDistancetime
);

router.get(
    '/get-suggestion',
    query('suggestion').isString().isLength({ min: 3 }),
    mapController.getAutocompleteSuggestion
);

module.exports = router;