//link:https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'


const userSchema = new mongoose.Schema({
    watchHistory:[{                         // array of Id of videos
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    }],
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,       // makes it search optimized, but expensive
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,    // searching through Name
    },
    avatar:{
        type:String,   // cloudinary url
        required:true,
        unique:true,
    },
    coverImage:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
        required: [true, 'Password is Required!'],
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

userSchema.pre('save', async function(next){   // (err,req,res,next) 
    if (! this.isModified("password")) {       //if not modified then call next;
        next(); return;
    }
    this.password = await bcryptjs.hash(this.password, 20);   // hashing password 20 rounds
    next(); 

    
})

userSchema.methods.isCorrectPassword = async function (password) {
    return await bcryptjs.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id:this.id,
        username:this.username,
        iat: Math.floor(Date.now() / 1000)   // initiated at
    },
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    {expiresIn: 15*60}     // 900 secs or 15 mins
)}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id:this.id,
    },
    process.env.REFRESH_TOKEN_PRIVATE_KEY,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}     
)}

export const User = mongoose.model("User",userSchema);