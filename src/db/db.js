import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log(`\nMongoDB connected!`);
        const connectionDetails = {
            host: connectionInstance.connection.host,
            port: connectionInstance.connection.port,
            name: connectionInstance.connection.name,
            readyState: connectionInstance.connection.readyState,
            id: connectionInstance.connection.id,
        };
      return connectionDetails;
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB