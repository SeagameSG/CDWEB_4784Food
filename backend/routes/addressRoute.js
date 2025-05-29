import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post("/list", authMiddleware, getUserAddresses);
addressRouter.post("/add", authMiddleware, addAddress);
addressRouter.post("/update", authMiddleware, updateAddress);
addressRouter.post("/delete", authMiddleware, deleteAddress);
addressRouter.post("/set-default", authMiddleware, setDefaultAddress);

export default addressRouter;