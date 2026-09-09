const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
           
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'busy', 'inactive'],
        default: 'inactive',
    },
    vehical: {
        color: {
            type: String,
            required: true,
            minlength: [3, 'color must atleast 3 character'],
        },
        plate: {
            type: String,
            required: true,
            minlength: [1, 'length must be 3 number long ']
        },
        capacity: {
            type: Number,
            required: true,
            minlength: [1, 'must be oe or greater than one ']
        },
        vehicaltype: {
            type: String,
            required: true,
            enum: ['car', 'bike', 'auto'],
        }
    },
    location: {
        ltd: {
            type: Number,
        },
        log: {
            type: Number
        }
    }
});

captainSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

captainSchema.methods.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.password);
};

captainSchema.methods.comparePassword = captainSchema.methods.comparePasswords;

captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;