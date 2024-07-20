import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}))

app.use(express.json({limit:'50kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(express.static("public"))
app.use(cookieParser())


// route import
import {userRouter} from './routes/user.route.js'

// route declare
app.use("api/v1/users", userRouter)

// http://localhost:5000/api/v1/users/register
// http://localhost:5000/api/v1/users/login

export {app};