//link:https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './db/db.js';

dotenv.config({
    path:'./.env'
})
const app = express();

connectDB();



// import mongoose from 'mongoose'
// import { DB_name } from './constants.js'
// import express from 'express'
//
// const app = express();

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`);

//         app.get('/',(req,res)=>{
//             res.send(`<h1>DB Connected!!</h1>`)
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`Live on Localhost:${process.env.PORT}`);
//         })

//     } catch (err) {
//         console.log(err);
//     }
// })()