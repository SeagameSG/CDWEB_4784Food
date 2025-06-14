import React, { useEffect, useState } from "react";
import "./Reviews.css";
import axios from "axios";
import { toast } from "react-toastify";

const Reviews = ({ url }) => {
    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${url}/api/review/all`);
            if (response.data.success) {
                setReviews(response.data.data);
            } else {
                toast.error("Data not found");
            }
        } catch (error) {
            toast.error("Error fetching data");
        }
    };

    const deleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                const response = await axios.delete(`${url}/api/review/delete`, {
                    data: { id: reviewId }
                });
                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchReviews();
                } else {
                    toast.error(response.data.message || "Error deleting review");
                }
            } catch (error) {
                toast.error("Request failed");
            }
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="reviews">
            <div className="reviews-header">
                <p>All Reviews</p>
            </div>
            <div className="reviews-table-format title">
                <b>Food</b>
                <b>Customer</b>
                <b>Rating</b>
                <b>Comment</b>
                <b>Date</b>
                <b>Action</b>
            </div>
            {reviews.map((review, index) => (
                <div key={index} className="reviews-table-format">
                    <p>{review.foodName}</p>
                    <div className="customer-info">
                        <p><strong>{review.customerName}</strong></p>
                        <p className="customer-email">{review.customerEmail}</p>
                    </div>
                    <div className="rating-display">
                        <span className="stars">{renderStars(review.rating)}</span>
                        <span className="rating-number">({review.rating}/5)</span>
                    </div>
                    <p className="comment">{review.comment}</p>
                    <p className="date">{formatDate(review.createdAt)}</p>
                    <button
                        onClick={() => deleteReview(review._id)}
                        className="delete-btn"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Reviews;