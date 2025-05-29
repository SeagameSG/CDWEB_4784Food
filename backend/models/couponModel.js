import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true 
    },
    discountPercentage: { 
        type: Number, 
        required: true,
        min: 0,
        max: 100 
    },
    applicableCategories: { 
        type: [String], 
        default: ["ALL"] 
    },
    used: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);

export default couponModel;