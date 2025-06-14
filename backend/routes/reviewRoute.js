import express from "express";
import { addReview, getLatestReviews, getAllReviews, deleteReview, getFoodRating } from "../controllers/reviewController.js";

const reviewRoute = express.Router();

reviewRoute.post("/add", addReview);
reviewRoute.get("/latest", getLatestReviews);
reviewRoute.get("/all", getAllReviews);
reviewRoute.delete("/delete", deleteReview);
reviewRoute.get("/rating/:foodId", getFoodRating);

export default reviewRoute;