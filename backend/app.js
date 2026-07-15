const dotenv=require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");

const userRoute=require('./routes/user.routes');
const captainRoute=require('./routes/captain.route');

const app = express();  
const connectToDb=require('./db/db')  ;
connectToDb();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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

app.use('/users',userRoute);
app.use('/captains',captainRoute);
module.exports=app;