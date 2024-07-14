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
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
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
        required: true,
        lowercase: true,
    },
    refreshToken:{

    }
},{timestamps:true})

export const User = mongoose.model("User",UserSchema);