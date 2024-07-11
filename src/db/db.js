import mongoose from "mongoose";
import express from 'express'
import { DB_name } from "../constants.js";

const app = express();

export const connectDB = async () =>{
    try {
          const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`);

          app.get('/',(req,res)=>{
            res.send(`<h1>DB Connected!!</h1>`)
        })
          app.get('/connection',(req,res)=>{
             res.send(`Connection Instance:${connectionInstance}`)
          })
          app.listen(process.env.PORT,()=>{
            console.log(`Live on Localhost:${process.env.PORT}`);
            })
  
    } catch (err) {
          console.error('DataBase Connection Error:\n',err);
          process.exit(1)
            }
}