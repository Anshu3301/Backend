//link:https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj
import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

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

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",VideoSchema)