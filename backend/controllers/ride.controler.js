const riderService = require('../services/ride.sevices');
const { validationResult } = require('express-validator');
const { dispatchRideRequest } = require('../socket');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicalType, vehicleType } = req.body;
    const finalVehicleType = vehicleType || vehicalType;

    try {
        const ride = await riderService.createRide({
            user: req.user?._id || req.user?.id,
            pickup,
            destination,
            vehicleType: finalVehicleType,
            vehicalType: finalVehicleType,
        });

        try {
            await dispatchRideRequest(ride._id);
        } catch (dispatchError) {
            console.error('Ride dispatch failed:', dispatchError.message);
        }
        return res.status(201).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
module.exports.getFare=async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {pickup,destination}=req.query;
    try{
        const fare=await riderService.getFare(pickup,destination);
        return res.status(200).json(fare);

    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

module.exports.getUserRides = async (req, res) => {
    try {
        const rides = await riderService.getUserRides(req.user?._id || req.user?.id);
        return res.status(200).json(rides);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};