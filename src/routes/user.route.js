import express from "express";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { registerUser,loginUser, logoutUser } from "../controllers/user.controller.js";


const userRouter = express.Router()

userRouter.route("/register").post(upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser);

// Secured Routes
userRouter.route("/logout").post(verifyToken, logoutUser)

export {userRouter}
