import React from "react";
import { motion } from "framer-motion";
import "./AboutUs.css";
import { assets } from "../../assets/assets";
import { useTranslation } from 'react-i18next';

const AboutUs = () => {
  const { t } = useTranslation();
  
  const handleOrderNow = () => {
    document.querySelector('#explore-menu').scrollIntoView({ behavior: 'smooth' });
  };
  
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
          <h2>{t('aboutUs.title')}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('aboutUs.description') }} />
          <p>
            {t('aboutUs.additionalInfo')}
          </p>
          <button className="learn-more-btn" onClick={handleOrderNow}>{t('aboutUs.orderNow')}</button>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutUs;