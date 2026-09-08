const blacklistTokenModel = require("../models/blacklist.model");
const captainModel = require("../models/captain.model");
const usermodel=require('../models/usermodel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const extractToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader === 'string') {
        const parts = authHeader.trim().split(/\s+/);
        if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
            return parts[1];
        }
        if (parts.length === 1) {
            return parts[0];
        }
    }

    if (req.cookies?.token) return req.cookies.token;
    if (req.headers['x-auth-token']) return req.headers['x-auth-token'];
    if (req.headers.token) return req.headers.token;

    return null;
};

module.exports.authUser = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ message: "token not exist" });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'user not found' });
        }
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "invalid token" });
    }
};

module.exports.authCaptain=async(req,res,next)=>{
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ message: "token not exist" });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            return res.status(401).json({ message: 'user not found' });
        }
        req.captain = captain;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "invalid token" });
    }

}