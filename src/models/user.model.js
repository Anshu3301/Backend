import mongoose from "mongoose";
import jsonwebtoken from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'


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

UserSchema.pre('save', async function(next){   // (err,req,res,next) 
    if (! this.isModified("password")) {       //if not modified then call next;
        next(); return;
    }
    bcryptjs.hash(this.password, 20);   // hashing password 20 rounds
    next(); 

    // if (this.isModified("password")){       // if modified then only hash the new password
    //     bcryptjs.hash(this.password, 20);   // hashing password 20 rounds
    //     next();                             // after hashing call next task
    // }
    // else{
    //     next();
    // }
    
})

UserSchema.methods.isCorrectPassword = async function (password) {
    return await bcryptjs.compare(password,this.password);
}

export const User = mongoose.model("User",UserSchema);