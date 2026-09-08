const express = require('express');
const router = express.Router();
const { body ,query } = require('express-validator');
const rideController = require('../controllers/ride.controler');
const authMiddleware = require('../middleware/auth.middleware');

const normalizeRideRequest = (req, res, next) => {
    req.body = req.body || {};
    req.body.vehicleType = req.body.vehicleType || req.body.vehicalType;
    next();
};

router.post('/create',
    authMiddleware.authUser,
    normalizeRideRequest,
    [
        body('pickup').trim().isString().isLength({ min: 3 }).withMessage('invalid location'),
        body('destination').trim().isString().isLength({ min: 3 }).withMessage('invalid destination'),
        body('vehicleType').optional().trim().isIn(['auto', 'car', 'motorcycle']).withMessage('invalid vehicle type'),
    ],
    rideController.createRide
);

router.get('/getFare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('invalid pickup'),
    query('destination').isString().isLength({min:3}).withMessage('invalid pickup'),
    rideController.getFare
)

module.exports = router;