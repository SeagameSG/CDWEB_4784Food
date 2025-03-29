import React from "react";
import { motion } from "framer-motion";
import "./AboutUs.css"; // Import CSS file
import { assets } from "../../assets/assets";

const AboutUs = () => {
  return (
    <div className="about-container" id="about-us">
      <div className="about-content">
        
        {/* Left Side - Image */}
        <motion.div
          className="about-image"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={assets.header_img12}
            alt="About Us"
            className="about-img"
          />
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          className="about-text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2>About Us</h2>
          <p>
            Welcome to <span>4784.</span>, Cảm ơn bạn đã quan tâm và ghé thăm website của chúng tôi.
            Chúng tôi hứa hẹn sẽ mang đến những món ăn ngon và tươi mới với tốc độ giao hàng nhanh chóng,
            hãy đặt hàng và nhận ngay trước cửa nhà bạn.
          </p>
          <p>
          Hy vọng bạn có một buổi ăn ngon miệng và một hành trình hạnh phúc!
          </p>
          <button className="learn-more-btn">Đặt ngay</button>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutUs;
