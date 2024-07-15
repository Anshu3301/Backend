import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
     videoFile:{
        type:String,        // url
        required:true,
        unique:true
     },
     thumbnail:{
        type:String,
        required:true,
        unique:true
     },
     uploader:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
     },
     title:{
        type:String,
        required:true,
     },
     description:{
        type:String,
        required:true,
     },
     duration:{
        type:Number,
        required:true,
     },
     views:{
        type:Number,
        required:true,
        default:0
     },
     likes:{
        type:Number,
        required:true,
        default:0
     },
     isPublished:{
        type:Boolean,
        required:true,
        default:true,
     }
},{timestamps:true})

export const Video = mongoose.model("Video",VideoSchema)