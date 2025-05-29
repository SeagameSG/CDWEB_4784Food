import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  verifyOrder, 
  userOrders, 
  listOrders, 
  updateStatus, 
  updatePaymentStatus, 
  createVnpayPaymentUrl, 
  createCodOrder, 
  vnpayReturn
} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post("/place-vnpay", authMiddleware, createVnpayPaymentUrl);
orderRouter.post("/place-cod", authMiddleware, createCodOrder);
orderRouter.get("/vnpay-return", vnpayReturn);
orderRouter.post("/verify", verifyOrder);

orderRouter.post("/userorders", authMiddleware, userOrders);

orderRouter.get("/list", listOrders);
orderRouter.post("/admin/update-status", updateStatus);
orderRouter.post("/admin/update-payment", updatePaymentStatus);

export default orderRouter;