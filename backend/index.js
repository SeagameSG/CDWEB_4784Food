import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from './config/databaseConf.js';
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import addressRouter from './routes/addressRoute.js';
import couponRoutes from './routes/couponRoute.js';

// Load environment variables
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(cors())


// db Connection
connectDB();


// api end point
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use('/api/address', addressRouter);
app.use('/api/coupon', couponRoutes);


app.get("/", (req, res) => {
    res.send("API Working")
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});