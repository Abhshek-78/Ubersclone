const usermodel=require('../models/usermodel');



module.exports.createUser=async({
    firstname,lastname,email,password
})=>{
    const normalizedEmail=(email || '').trim().toLowerCase();

    if(!firstname || !normalizedEmail || !password){
        throw new Error('all fields are required');
    }

    const existingUser=await usermodel.findOne({email:normalizedEmail});
    if(existingUser){
        const error=new Error('Email already exists');
        error.statusCode=409;
        throw error;
    }

    try {
        const user=await usermodel.create({
            fullname:{
                firstname,
                lastname
            },
            email:normalizedEmail,
            password
        });
        return user;
    } catch (err) {
        if(err.code===11000){
            const error=new Error('Email already exists');
            error.statusCode=409;
            throw error;
        }
        throw err;
    }
}
    
