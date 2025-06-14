import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";

// Add review
const addReview = async (req, res) => {
    try {
        const { foodId, customerName, customerEmail, rating, comment } = req.body;

        // Get food details
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        const review = new reviewModel({
            foodName: food.name,
            foodId,
            customerName,
            customerEmail,
            rating,
            comment
        });

        await review.save();
        res.json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
};

// Get latest reviews (limited to 15)
const getLatestReviews = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { status: 'active' };

        if (search) {
            query.foodName = { $regex: search, $options: 'i' };
        }

        const reviews = await reviewModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(15);

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Get all reviews for admin
const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel
            .find()
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.body;
        await reviewModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting review" });
    }
};

// Get average rating for a food
const getFoodRating = async (req, res) => {
    try {
        const { foodId } = req.params;

        const reviews = await reviewModel
            .find({ foodId, status: 'active' })
            .sort({ createdAt: -1 })
            .limit(15);

        if (reviews.length === 0) {
            return res.json({ success: true, data: { averageRating: 0, totalReviews: 0 } });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.json({
            success: true,
            data: {
                averageRating: Math.round(averageRating),
                totalReviews: reviews.length
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error calculating rating" });
    }
};

export { addReview, getLatestReviews, getAllReviews, deleteReview, getFoodRating };