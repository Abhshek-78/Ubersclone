const rideModel = require('../models/ride.model');
const mapService = require('./map.service');
const crypto = require('crypto');

async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Choose pickup and destination address');
    }

    const distanceTime = await mapService.getDistancetime(pickup, destination);
    const distanceInKm = distanceTime.distance.value / 1000;
    const timeInMinutes = distanceTime.duration.value / 60;

    const baseFare = {
        car: 20,
        motorcycle: 10,
        auto: 15,
    };

    const perKmRate = {
        car: 11,
        motorcycle: 3,
        auto: 5,
    };

    const perMinuteRate = {
        car: 1,
        motorcycle: 0.5,
        auto: 0.75,
    };

    const fare = {
        car: Math.round(baseFare.car + (distanceInKm * perKmRate.car) + (timeInMinutes * perMinuteRate.car)),
        motorcycle: Math.round(baseFare.motorcycle + (distanceInKm * perKmRate.motorcycle) + (timeInMinutes * perMinuteRate.motorcycle)),
        auto: Math.round(baseFare.auto + (distanceInKm * perKmRate.auto) + (timeInMinutes * perMinuteRate.auto)),
    };

    return fare;
}

module.exports.createRide = async ({ user, pickup, destination, vehicleType, vehicalType }) => {
    const finalVehicleType = vehicleType || vehicalType;

    if (!user || !pickup || !destination || !finalVehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);
    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp:getOtp(4),
        vehicleType: finalVehicleType,
        fare: fare[finalVehicleType] || fare.auto,
    });

    return ride;
};

function getOtp(digits = 4) {
  const min = 0;
  const max = Math.pow(10, digits);
  
  const otpNumber = crypto.randomInt(min, max);

  return otpNumber.toString().padStart(digits, '0');
}

module.exports.getFare = getFare;