import mongoose from "mongoose";
import { DB_name } from "../constants.js";

export const connectDB = async () =>{
    try {
          const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`);
          return connectionInstance;
  
    } catch (err) {
          console.error('DataBase Connection Error:\n',err);
          process.exit(1)
            }
}