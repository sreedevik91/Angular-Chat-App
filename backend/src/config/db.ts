import mongoose from "mongoose";
import { config } from "dotenv";

config()

const connectDb= ()=>{
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING!).then(()=>{
        console.log('database connected');
        
    }).catch((error)=>{
        console.error('something went wrong while connecting to database',error);
        
    })
}

export default connectDb