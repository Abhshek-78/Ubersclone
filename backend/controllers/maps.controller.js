const mapService = require('../services/map.service');
const { validationResult } = require('express-validator');

module.exports.getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        return res.status(200).json(coordinates);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ message: error.message || 'Coordinate not found' });
    }
};

module.exports.getDistancetime = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination } = req.query;

    try {
        const distanceTime = await mapService.getDistancetime(origin, destination);
        return res.status(200).json(distanceTime);
    } catch (err) {
        console.error(err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || 'Internal server error' });
    }
};

module.exports.getAutocompleteSuggestion = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { suggestion } = req.query;

    try {
        const suggestions = await mapService.getAutocompleteSuggestion(suggestion);
        return res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || 'Internal server error' });
    }
};

module.exports.getAddressFromCoordinates = async (req, res, next) => {
    const { latitude, longitude } = req.query;

    try {
        const address = await mapService.getAddressFromCoordinates(Number(latitude), Number(longitude));
        return res.status(200).json(address);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ message: error.message || 'Location not found' });
    }
};