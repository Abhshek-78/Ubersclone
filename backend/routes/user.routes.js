const express=require('express');
const router=express.Router();
const {body}=require("express-validator");
const {route}=require('../app');
const userController=require('../controllers/userController')
const authMiddleware=require('../middleware/auth.middleware')

const normalizeUserRequest = (req, res, next) => {
    req.body = req.body || {};

    if (!req.body.fullname && req.body.fullName) {
        req.body.fullname = req.body.fullName;
    }

    if (!req.body.fullname) {
        req.body.fullname = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        };
    }

    next();
};

router.post('/register', normalizeUserRequest, [
    body('email').trim().notEmpty().withMessage('email is required').isEmail().withMessage('invalid mail'),
    body('fullname.firstname').trim().notEmpty().withMessage('first name is required').isLength({min:3}).withMessage('first name length must be > than 3 character'),
    body('password').trim().notEmpty().withMessage('password is required').isLength({min:6}).withMessage("password must be > than 6 character"),
    body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('invalid phone number'),
],
userController.registerUser
)

router.post('/login',[
    body('email').isEmail().withMessage('invalid mail'),
    body('password').isLength({min:6}).withMessage("password must be > than 6 character"),
],
    userController.loginUser
)

router.get('/profile',authMiddleware.authUser,userController.getUserProfile)

router.get('/logout',authMiddleware.authUser,userController.logoutUser)







module.exports=router;