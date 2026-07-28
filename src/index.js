// require('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
import connectDB from './db/index.js';
dotenv.config()

import express from 'express'

const app=express();

connectDB()





















/*
//To directory call the connection mongoDb function, using IIFE(Immediately Invoked function execution)

// ;(async ()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on('error',(err)=>{
//         console.log('Error :',err)
//         throw err

//         app.listen(process.env.PORT,()=>console.log(`Server starts at ${process.env.PORT}`))
//        })
//     } catch (error) {
//         console.error('MongoDb connection failed', error)
//         throw error
        
//     }
// })() 

//always start IIFE with semicolon, because if in previous code there is no ; to end that,it could give an issue.
*/