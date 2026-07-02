const captainModel=require('../models/captain.model');
const captainService=require('../services/captain.sevice');
const {validationResult}=require('express-validator');



module.exports.registerCaptain=async(req,res,next)=>{
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error:error.array()});
    }

    try {
        const { fullname, email, password, vehical } = req.body;
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
