//link:https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

import dotenv from 'dotenv';
import { app } from './app.js';
import  connectDB  from './db/db.js';

dotenv.config({
    path: './.env'
});

connectDB()
    .then((connectionDetails) => {
        app.use("/",(req,res)=>{res.send(`<h1>DB Connected!!</h1>\nConnection Details:${JSON.stringify(connectionDetails, null, 2)}`)});

        app.listen(process.env.PORT || 6000, () => {
            console.log(`Live on Localhost:${process.env.PORT || 6000}`);
        });
    })
    .catch((err) => {
        console.log(`DB Connection Problem:\n${err}`);
    });
    




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