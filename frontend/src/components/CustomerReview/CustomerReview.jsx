import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./CustomerReview.css";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { toast } from "react-toastify";

const CustomerReview = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodId: "",
    customerName: "",
    customerEmail: "",
    rating: 5,
    comment: ""
  });

  const url = "http://localhost:3000";

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${url}/api/review/latest`, {
        params: { search: searchTerm }
      });
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchTerm]);

  useEffect(() => {
    fetchFoodList();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/review/add`, formData);
      if (response.data.success) {
        toast.success(t('customerReview.reviewAdded'));
        setShowAddModal(false);
        setFormData({
          foodId: "",
          customerName: "",
          customerEmail: "",
          rating: 5,
          comment: ""
        });
        fetchReviews();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(t('customerReview.addError'));
    }
    setLoading(false);
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="customer-review" id="review">
      <section className="customer-reviews">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {t('customerReview.title')}
        </motion.h2>

        <div className="review-controls">
          <button 
            className="add-review-btn"
            onClick={() => setShowAddModal(true)}
          >
            +
          </button>
          <input
            type="text"
            placeholder={t('customerReview.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="review-search"
          />
        </div>
        
        <div className="reviews-container">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              className="review-card"
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                delay: index * 0.3,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              whileHover={{ transition: { duration: 0.2 } }}
            >
              <div className="review-header">
                <img 
                  src={`https://ui-avatars.com/api/?name=${review.customerName}&background=2E8B57&color=fff`} 
                  alt={review.customerName} 
                />
                <div>
                  <h4>{review.customerName}</h4>
                  <div className="stars">{renderStars(review.rating)}</div>
                  <p className="food-name">{review.foodName}</p>
                </div>
              </div>
              <p>{review.comment}</p>
            </motion.div>
          ))}
        </div>

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{t('customerReview.addReview')}</h3>
              <form onSubmit={handleSubmit}>
                <select
                  name="foodId"
                  value={formData.foodId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('customerReview.selectFood')}</option>
                  {foodList.map(food => (
                    <option key={food._id} value={food._id}>
                      {food.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="customerName"
                  placeholder={t('customerReview.customerName')}
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="email"
                  name="customerEmail"
                  placeholder={t('customerReview.customerEmail')}
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                />

                <div className="rating-input">
                  <label>{t('customerReview.rating')}: </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('customerReview.star') : t('customerReview.stars')}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  name="comment"
                  placeholder={t('customerReview.comment')}
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />

                <div className="modal-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? t('customerReview.submitting') : t('customerReview.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                  >
                    {t('customerReview.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerReview;