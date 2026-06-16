import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected successfully.")
    } catch(error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    } 
}

export default connectDB;