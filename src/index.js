
//Before
// import dotenv from 'dotenv'
// dotenv.config()

//after
import 'dotenv/config'

import connectDB from './db/index.js';


import express from 'express'
import { app } from './app.js';



connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>console.log(`Server starts at ${process.env.PORT}`))
}).catch((err)=>console.log('ERROR: MONGODB CONNECTION FAILED',err))





















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