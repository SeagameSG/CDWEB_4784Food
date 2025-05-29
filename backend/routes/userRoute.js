import express from 'express'
import { loginUser, registerUser, getUserProfile, updateUserProfile, resetPassword } from '../controllers/userController.js'
import {userAuthMiddleware} from "../middleware/userAuth.js";

const userRouter = express.Router()

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", userAuthMiddleware, getUserProfile);
userRouter.post("/profile/update", userAuthMiddleware, updateUserProfile);
userRouter.post("/profile/reset-password", userAuthMiddleware, resetPassword);

export default userRouter;