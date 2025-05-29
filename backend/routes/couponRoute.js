import express from 'express'
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateAndApplyCoupon,markCouponAsUsed } from '../controllers/couponController.js'
import authMiddleware from '../middleware/auth.js';

const couponRouter = express.Router();

couponRouter.get("/admin/list", getAllCoupons)
couponRouter.post("/admin/create", createCoupon)
couponRouter.put("/admin/update/:id", updateCoupon)
couponRouter.delete("/admin/delete/:id", deleteCoupon)
couponRouter.post("/validate", authMiddleware, validateAndApplyCoupon)
couponRouter.post("/mark-used", authMiddleware, markCouponAsUsed)

export default couponRouter;