import mongoose from "mongoose";
import { config } from "dotenv";

config()

const connectDb= ()=>{
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING!).then(()=>{
        console.log('database connected');
        
    }).catch(()=>{
        console.error('something went wrong while connecting to database');
        
    })
}

export default connectDb