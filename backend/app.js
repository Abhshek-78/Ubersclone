const dotenv=require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");

const userRoute=require('./routes/user.routes');

const app = express();  
const connectToDb=require('./db/db')  ;
connectToDb();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({extended:true}))   ;      


app.get('/',(req,res)=>{
    res.send("hellow");
});

app.use('/users',userRoute);
module.exports=app;