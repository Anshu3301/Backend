import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

export const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// route import
import {userRouter} from './routes/user.route.js'

// route declare
app.use("/api/v1/users", userRouter)

// http://localhost:8080/api/v1/users/register
// http://localhost:8080/api/v1/users/login