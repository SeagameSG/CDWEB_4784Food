import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    foodName: { type: String, required: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;