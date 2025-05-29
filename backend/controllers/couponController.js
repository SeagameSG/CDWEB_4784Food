import couponModel from "../models/couponModel.js";
import foodModel from "../models/foodModel.js";

// [ADMIN] Lấy tất cả mã giảm giá
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ success: false, message: "Failed to fetch coupons" });
    }
};

// [ADMIN] Tạo mã giảm giá mới
const createCoupon = async (req, res) => {
    try {
        const { name, discountPercentage, applicableCategories } = req.body;
        
        // Kiểm tra tên coupon đã tồn tại chưa
        const existingCoupon = await couponModel.findOne({ name });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }
        
        // Tạo coupon mới
        const newCoupon = new couponModel({
            name,
            discountPercentage,
            applicableCategories: applicableCategories || ["ALL"],
            used: false
        });
        
        await newCoupon.save();
        res.status(201).json({ success: true, data: newCoupon, message: "Coupon created successfully" });
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to create coupon" });
    }
};

// [ADMIN] Cập nhật mã giảm giá
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, discountPercentage, applicableCategories, used } = req.body;
        
        // Kiểm tra nếu đổi tên, thì tên mới đã tồn tại chưa
        if (name) {
            const existingCoupon = await couponModel.findOne({ name, _id: { $ne: id } });
            if (existingCoupon) {
                return res.status(400).json({ success: false, message: "Coupon code already exists" });
            }
        }
        
        const updatedCoupon = await couponModel.findByIdAndUpdate(
            id,
            { name, discountPercentage, applicableCategories, used },
            { new: true }
        );
        
        if (!updatedCoupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        
        res.json({ success: true, data: updatedCoupon, message: "Coupon updated successfully" });
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to update coupon" });
    }
};

// [ADMIN] Xóa mã giảm giá
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await couponModel.findByIdAndDelete(id);
        
        if (!deletedCoupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ success: false, message: "Failed to delete coupon" });
    }
};

// [USER] Xác thực và áp dụng mã giảm giá
const validateAndApplyCoupon = async (req, res) => {
    try {
        const { couponCode, cartItems } = req.body;
        
        // Tìm coupon theo tên
        const coupon = await couponModel.findOne({ name: couponCode });
        
        // Kiểm tra coupon có tồn tại không
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }
        
        // Kiểm tra coupon đã được sử dụng chưa
        if (coupon.used) {
            return res.status(400).json({ success: false, message: "Coupon has already been used" });
        }
        
        // Lấy danh sách các món ăn trong giỏ hàng
        const foodIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
        const foodItems = await foodModel.find({ _id: { $in: foodIds } });
        
        // Tính toán giảm giá
        let totalDiscount = 0;
        let affectedCategories = coupon.applicableCategories.includes("ALL") 
            ? "all items" 
            : coupon.applicableCategories.join(", ");
        
        // Tính tổng giá trị được giảm
        for (const food of foodItems) {
            if (coupon.applicableCategories.includes("ALL") || coupon.applicableCategories.includes(food.category)) {
                // Tính giảm giá cho món ăn
                const itemTotal = food.price * cartItems[food._id];
                const itemDiscount = (itemTotal * coupon.discountPercentage) / 100;
                totalDiscount += itemDiscount;
            }
        }
        
        res.json({
            success: true,
            data: {
                coupon,
                discountAmount: totalDiscount,
                discountPercentage: coupon.discountPercentage,
                affectedCategories
            },
            message: "Coupon applied successfully"
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to validate coupon" });
    }
};

// [USER] Đánh dấu mã giảm giá đã sử dụng
const markCouponAsUsed = async (req, res) => {
    try {
        const { couponCode } = req.body;
        
        const updatedCoupon = await couponModel.findOneAndUpdate(
            { name: couponCode, used: false },
            { used: true },
            { new: true }
        );
        
        if (!updatedCoupon) {
            return res.status(404).json({ 
                success: false, 
                message: "Coupon not found or already used" 
            });
        }
        
        res.json({ success: true, message: "Coupon marked as used" });
    } catch (error) {
        console.error("Error marking coupon as used:", error);
        res.status(500).json({ success: false, message: "Failed to mark coupon as used" });
    }
};

export {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateAndApplyCoupon,
    markCouponAsUsed
};