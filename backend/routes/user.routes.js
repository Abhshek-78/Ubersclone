const express=require('express');
const router=express.Router();
const {body}=require("express-validator");
const {route}=require('../app');
const userController=require('../controllers/userController')
const authMiddleware=require('../middleware/auth.middleware')

router.post('/register',[
    body('email').isEmail().withMessage('invalid mail'),
    body('fullname.firstname').isLength({min:3}).withMessage('first name length must be > than 3 character'),
    body('password').isLength({min:6}).withMessage("password must be > than 6 character"),
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