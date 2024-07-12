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
            const connectionDetails = {
              host: connectionInstance.connection.host,
              port: connectionInstance.connection.port,
              name: connectionInstance.connection.name,
              readyState: connectionInstance.connection.readyState,
              id:connectionInstance.connection.id,
          };
             res.send(`Connection Instance:${JSON.stringify(connectionDetails, null, 2)}`)
          })
          app.listen(process.env.PORT,()=>{
            console.log(`Live on Localhost:${process.env.PORT}`);
            })
  
    } catch (err) {
          console.error('DataBase Connection Error:\n',err);
          process.exit(1)
            }
}