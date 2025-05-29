import React, { useState, useEffect } from 'react';
import './Header.css';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';

const images = [
  assets.header_img2,
  assets.header_img4,
  assets.header_img7,
  assets.header_img5,
  assets.header_img11,
  assets.header_img12
];

const Header = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleViewMenu = () => {
    document.querySelector('#explore-menu').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="header" style={{ backgroundImage: `url(${images[currentImage]})` }}>
      <div className="header-contents">
        <h2>{t('header.title')}</h2>
        <p>{t('header.subtitle')}</p>
        <button onClick={handleViewMenu}>{t('header.viewMenu')}</button>
      </div>
    </div>
  );
};

export default Header;