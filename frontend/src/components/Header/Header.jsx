import React, { useState, useEffect } from 'react';
import './Header.css';
import { assets } from '../../assets/assets'


const images = [
  assets.header_img2,
  assets.header_img4,
  // assets.header_img7,
  assets.header_img5,
  // assets.header_img10,
  assets.header_img11,
  assets.header_img12
];

const Header = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header" style={{ backgroundImage: `url(${images[currentImage]})` }}>
      <div className="header-contents">
        <h2>4784 - Từ Daklak đến Trà Vinh</h2>
        <p>Chọn món là việc của bạn, giao nó đến bạn là cách chúng tôi có tiền.</p>
        <button>Xem Menu</button>
      </div>
    </div>
  );
};

export default Header;
