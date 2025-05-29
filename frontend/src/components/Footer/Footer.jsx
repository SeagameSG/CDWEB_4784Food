import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo3} alt="" />
                <p>{t('footer.description')}</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>{t('footer.company')}</h2>
                <ul>
                    <li>{t('footer.home')}</li>
                    <li>{t('footer.aboutUs')}</li>
                    <li>{t('footer.shipping')}</li>
                    <li>{t('footer.privacyPolicy')}</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>
                    {t('footer.contact')}</h2>
                <ul>
                    <li>+84 8684 09021</li>
                    <li>21130317@st.hcmuaf.edu.vn</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">{t('footer.copyright')}</p>
    </div>
  )
}

export default Footer