const captainModel=require('../models/captain.model');



module.exports.createCaptain=async({
    firstname,lastname,email,phone,password,color,plate,capacity,vehicaltype
})=>{
    if(!firstname || !lastname || !email || !password || !color || !plate || !capacity  || !vehicaltype){
        throw new Error('all fiend are require ');
    }

    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname,
        },
        email,
        phone,
        password,
        vehical: {
            color,
            plate,
            capacity,
            vehicaltype,
        }
    });

    return captain;
}