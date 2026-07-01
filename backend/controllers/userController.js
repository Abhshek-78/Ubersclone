const usermodel=require('../models/usermodel');
const userServices=require('../services/user.sevice');
const {validationResult}=require('express-validator');
const blacklistTokenModel=require('../models/blacklist.model');

module.exports.registerUser=async (req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    try {
        const {fullname,email,password}=req.body;
        const hashPassword=await usermodel.hashPassword(password);
        const user=await userServices.createUser({
            firstname:fullname.firstname,
            lastname:fullname.lastname,
            email,
            password:hashPassword
        });
        const token=user.generateAuthToken();
        return res.status(201).json({token,user})
    } catch (err) {
        if(err.statusCode===409){
            return res.status(409).json({message:err.message});
        }
        return res.status(500).json({message:'Registration failed',error:err.message});
    }
}

//loging route backend program
module.exports.loginUser=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const  {email,password}=req.body
        const user=await usermodel.findOne({email}).select('+password');
        if (!user) {
            return res.status(401).json({message:'invalid email'});
        }
        const isMatch=await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({message:'invalid password'});

        }
        const token=user.generateAuthToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,      // true only when using HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({token,user});


    }catch(error){
        return res.status(401).json({message:'login  failed'});
    }
}

//for user profile
module.exports.getUserProfile=async (req,res,next)=>{
    res.status(200).json(req.user);
}
//logout
module.exports.logoutUser = async (req, res, next) => {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        });
    }

    res.clearCookie("token");

    await blacklistTokenModel.create({ token });

    return res.status(200).json({
        message: "Logout successful"
    });
};
 