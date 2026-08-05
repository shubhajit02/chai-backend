import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: '16kb' }))

app.use(express.urlencoded({ extended: false, limit: '16kb' }))

app.use(express.static('public'))

app.use(cookieParser())


//import routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use('/api/v1/user',userRouter)
//if user visit /user.... go to this userRouter

//http://localhost:8000/api/v2/user/register
//http://localhost:8000/api/v2/user/login


export { app }