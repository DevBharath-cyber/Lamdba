import mongoose from "mongoose";
// import dotenv from 'dotenv';
// dotenv.config();
import logger from "../Utils/logger.js";

const Mongodb = process.env.MONGODB_URI;

if(!Mongodb){
    logger.warn("MONGODB_URI is not defined in environment variables");
}

const connectDB = async () => {
    try {
        await mongoose.connect(Mongodb);
        console.log("MongoDB connected successfully 🎉");
    } catch (error) {
        logger.error("Error connecting to mongodb" + error);
        process.exit(1)
    }
}

export default connectDB;