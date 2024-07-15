import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
        type:String,   // cloudnary url
        required:true,
        unique:true,
    },
    coverImage:{
        type:String,
        required:true,
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

export const User = mongoose.model("User",UserSchema);