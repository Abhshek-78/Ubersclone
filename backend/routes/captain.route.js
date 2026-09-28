const captainController = require('../controllers/captain.Controller');
const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const authMiddleware=require('../middleware/auth.middleware');

const normalizeCaptainRequest = (req, res, next) => {
    req.body = req.body || {};

    if (!req.body.fullname) {
        req.body.fullname = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        };
    }

    if (!req.body.vehical && req.body.vehicle) {
        req.body.vehical = req.body.vehicle;
    }

    if (req.body.vehical) {
        req.body.vehical.color = req.body.vehical.color ?? req.body.color;
        req.body.vehical.plate = req.body.vehical.plate ?? req.body.plate;
        req.body.vehical.capacity = req.body.vehical.capacity ?? req.body.capacity;
        req.body.vehical.vehicaltype = req.body.vehical.vehicaltype ?? req.body.vehicaltype ?? req.body.vehicleType;
    }

    next();
};

router.post('/register', normalizeCaptainRequest, [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    body('fullname.firstname').trim().notEmpty().withMessage('First name is required').isString().withMessage('First name must be a string'),
    body('fullname.lastname').trim().notEmpty().withMessage('Last name is required').isString().withMessage('Last name must be a string'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
    body('vehical.color').trim().notEmpty().withMessage('Vehicle color is required').isString().withMessage('Vehicle color must be a string'),
    body('vehical.plate').notEmpty().withMessage('Plate number is required').custom((value) => {
        if (typeof value === 'number' && Number.isInteger(value) && value > 0) return true;
        if (typeof value === 'string' && value.trim() !== '') return true;
        throw new Error('Invalid plate number');
    }),
    body('vehical.capacity').notEmpty().withMessage('Capacity is required').isInt({ min: 1 }).withMessage('Invalid capacity'),
    body('vehical.vehicaltype').notEmpty().withMessage('Vehicle type is required').isIn(['car', 'bike', 'auto']).withMessage('Invalid vehicle type'),
],
   captainController.registerCaptain
);

router.post('/login',[
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({min:6}).withMessage('Invalid password')
],
    captainController.loginCaptain
)

router.get('/profile',authMiddleware.authCaptain,captainController.getCaptainProfile)

router.get('/logout',authMiddleware.authCaptain,captainController.logoutCaptain)

module.exports = router;