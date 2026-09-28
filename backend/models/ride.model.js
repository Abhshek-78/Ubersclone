const mongoose = require('mongoose');
const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['auto', 'car', 'motorcycle'],
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accept', 'ongoing', 'completed', 'cancel'],
        default: 'pending',
    },
    duration: {
        type: Number,
    },
    distance: {
        type: Number,
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    otp:{
        type: String,
        select:false,
        require:true

    }
}, { timestamps: true });

module.exports = mongoose.model('ride', rideSchema);
