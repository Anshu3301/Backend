import mongoose from "mongoose";

export const connectDB = async () =>{
    try {
          const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
          return connectionInstance;
  
    } catch (err) {
          console.error('DataBase Connection Error:\n',err);
          process.exit(1)
            }
}