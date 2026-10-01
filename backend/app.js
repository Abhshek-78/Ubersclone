const dotenv=require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoute=require('./routes/user.routes');
const captainRoute=require('./routes/captain.route');

const app = express();  
const cookieParser = require("cookie-parser");
const mapRoutes = require('./routes/map.routes');
const rideRoutes = require('./routes/ride.routes');
const { getAllowedOrigins } = require('./config');

app.use(cookieParser());
const allowedOrigins = getAllowedOrigins();
const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
        return next();
    }

    if (typeof req.body === 'string') {
        const rawBody = req.body.trim();
        if (!rawBody) {
            return next();
        }

        try {
            const parsedBody = JSON.parse(rawBody);
            req.body = typeof parsedBody === 'string' ? JSON.parse(parsedBody) : parsedBody;
        } catch (error) {
            return res.status(400).json({
                message: 'Invalid JSON payload. Send a JSON object, not a stringified JSON string.'
            });
        }
    }

    next();
});


app.get('/',(req,res)=>{
    res.send("hellow");
});

app.use('/users', userRoute);
app.use('/captains', captainRoute);
app.use('/maps', mapRoutes);
app.use('/ride', rideRoutes);
app.use('/rides', rideRoutes);
module.exports = app;