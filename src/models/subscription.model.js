//link: https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj
import mongoose,{ Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{                         // who is subscribing, store _id of them
        type:Schema.Types.ObjectId,
        ref: "User",
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Subscription = model("Subscription", subscriptionSchema)