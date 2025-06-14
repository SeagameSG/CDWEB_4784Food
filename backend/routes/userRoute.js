import express from 'express'
import { loginUser, registerUser, getUserProfile, updateUserProfile,requestChangePasswordOTP,changePasswordWithOTP } from '../controllers/userController.js'
import {userAuthMiddleware} from "../middleware/userAuth.js";

const userRouter = express.Router()

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", userAuthMiddleware, getUserProfile);
userRouter.post("/profile/update", userAuthMiddleware, updateUserProfile);
userRouter.post("/profile/request-otp", userAuthMiddleware, requestChangePasswordOTP);
userRouter.post("/profile/change-password-with-otp", userAuthMiddleware, changePasswordWithOTP);


export default userRouter;