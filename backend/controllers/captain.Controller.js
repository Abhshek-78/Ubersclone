const captainModel=require('../models/captain.model');
const captainService=require('../services/captain.sevice');
const { validationResult } = require('express-validator');
const blacklistModel = require('../models/blacklist.model');
const rideModel = require('../models/ride.model');
const { isProduction } = require('../config');



module.exports.registerCaptain=async(req,res,next)=>{
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error:error.array()});
    }

    try {
        const { fullname, email, phone, password, vehical } = req.body;
        const vehicalData = vehical;

        if (!fullname?.firstname || !fullname?.lastname || !email || !password || !vehicalData?.color || !vehicalData?.plate || !vehicalData?.capacity || !vehicalData?.vehicaltype) {
            return res.status(400).json({ message: 'Please provide all required captain details' });
        }

        const isCaptainAlreadyExist = await captainModel.findOne({ email });
        if (isCaptainAlreadyExist) {
            return res.status(400).json({ message: 'Captain already exists' });
        }

        const hashPassword=await captainModel.hashPassword(password);

        const captain=await captainService.createCaptain({
            firstname:fullname.firstname,
            lastname:fullname.lastname,
            email,
            phone,
            password:hashPassword,
            color:vehicalData.color,
            plate:vehicalData.plate,
            capacity:vehicalData.capacity,
            vehicaltype:vehicalData.vehicaltype
        });
        const token =captain.generateAuthToken();
        return res.status(201).json({token,captain});
    } catch (err) {
        return res.status(500).json({message:'Registration failed', error:err.message});
    }
}

//login the captain
module.exports.loginCaptain=async(req,res,next)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }
    try{
        const {email,password}=req.body;
        const captain=await captainModel.findOne({email}).select('+password');
        if (!captain) {
            return res.status(401).json({message:'invalid email and password'})
        }
        const isMatch=await captain.comparePassword(password);
         if (!isMatch) {
            return res.status(401).json({message:'invalid email and password'})
        }
        const token=captain.generateAuthToken();
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction(),
            sameSite: isProduction() ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({token,captain});
    }catch (error) {
        return res.status(401).json({message:'something went wrong ', error: error.message});
    }
}

module.exports.getCaptainProfile=async(req,res,next)=>{
    const [completedTrips, earnings] = await Promise.all([
        rideModel.countDocuments({ captain: req.captain._id, status: 'completed' }),
        rideModel.aggregate([
            { $match: { captain: req.captain._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$fare' } } },
        ]),
    ]);

    const currentOnlineSeconds = req.captain.onlineSince
        ? Math.max(0, Math.floor((Date.now() - req.captain.onlineSince.getTime()) / 1000))
        : 0;
    const totalOnlineSeconds = Number(req.captain.totalOnlineSeconds || 0) + currentOnlineSeconds;
    const requestsOffered = Number(req.captain.requestsOffered || 0);
    const requestsAccepted = Number(req.captain.requestsAccepted || 0);

    return res.status(200).json({
        captain: {
            ...req.captain.toObject(),
            completedTrips,
            totalEarnings: earnings[0]?.total || 0,
            totalOnlineSeconds,
            acceptanceRate: requestsOffered ? Number(((requestsAccepted / requestsOffered) * 100).toFixed(1)) : 0,
        },
    });
}

module.exports.logoutCaptain=async(req,res,next)=>{
    const token=req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
        await blacklistModel.create({ token });
    }
    res.clearCookie('token');
    return res.status(200).json({message:'logout success'});
}