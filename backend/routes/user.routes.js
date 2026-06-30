const express=require('express');
const router=express.Router();
const {body}=require("express-validator");
const {route}=require('../app');
const userController=require('../controllers/userController')

router.post('/register',[
    body('email').isEmail().withMessage('invalid mail'),
    body('fullname.firstname').isLength({min:3}).withMessage('first name length must be > than 3 character'),
    body('password').isLength({min:6}).withMessage("password must be > than 6 character"),
],
userController.registerUser
)







module.exports=router;