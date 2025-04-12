import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo3} alt="" />
                <p>Những ai muốn tận hưởng hương vị tuyệt vời phải chấp nhận thử thách. Trí tuệ dẫn lối cho sự lựa chọn hoàn hảo! Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời, nơi chất lượng và niềm vui hòa quyện. Hãy thưởng thức, đừng ngần ngại!</p>                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>CÔNG TY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Vận Chuyển</li>
                    <li>Chính sách bảo mật</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>
                    LIÊN HỆ</h2>
                <ul>
                    <li>+91-98980 98980</li>
                    <li>contact@mail.4784food.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">Copyright 2025 &#169; 4784 - Mọi quyền lợi được bảo lưu.</p>
    </div>
  )
}

export default Footer
