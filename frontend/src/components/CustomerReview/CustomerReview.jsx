import React from "react";
import { motion } from "framer-motion";
import "./CustomerReview.css";

const CustomerReview = () => {
  const reviews = [
    {
      id: 1,
      name: "Test1",
      image: "https://i.pravatar.cc/50?img=1",
      rating: 5,
      text: "Tuyệt vời",
    },
    {
      id: 2,
      name: "Test2",
      image: "https://i.pravatar.cc/50?img=2",
      rating: 4,
      text: "Ngon, giao nhanh",
    },

  ];

  return (
    <div className="customer-review" id="review">
      <section className="customer-reviews">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Đánh giá của khách hàng:
        </motion.h2>
        
        <div className="reviews-container">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="review-card"
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                delay: index * 0.3,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              whileHover={{  transition: { duration: 0.2 } }}
            >
              <div className="review-header">
                <img src={review.image} alt={review.name} />
                <div>
                  <h4>{review.name}</h4>
                  <div className="stars">{"★".repeat(review.rating)}</div>
                </div>
              </div>
              <p>{review.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomerReview;
