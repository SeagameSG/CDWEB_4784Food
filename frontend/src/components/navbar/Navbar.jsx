import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import {assets} from '../../assets/assets';
import {Link, useNavigate, useLocation} from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';

const Navbar = ({setShowLogin}) => {
    const [menu, setmenu] = useState("home");
    const { t, i18n } = useTranslation();
    const {getTotalCartAmount,token,setToken} = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isHomePage, setIsHomePage] = useState(true);

    useEffect(() => {
        setIsHomePage(location.pathname === '/');
    }, [location]);

    const toggleLanguage = () => {
      const newLang = i18n.language === 'en' ? 'vi' : 'en';
      i18n.changeLanguage(newLang);
    };

    // logout Function
    const logout = () => {
      localStorage.removeItem("token");
      setToken("");
      navigate("/", { replace: true });
    }

    const handleCartClick = (e) => {
      e.preventDefault();
      
      if (token) {
        navigate('/cart');
      } else {
        sessionStorage.setItem('intendedPath', '/cart');
        setShowLogin(true);
      }
    }

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo3} alt="" className="logo" /></Link>
      
      {/* Chỉ hiển thị navbar-menu khi đang ở trang chủ */}
      {isHomePage && (
        <ul className="navbar-menu">
          <a href='#explore-menu' onClick={() => setmenu("menu")} className={menu === "menu"?"active":""}>{t('navbar.menu')}</a>
          <a href='#app-download' onClick={() => setmenu("mobile-app")} className={menu === "mobile-app"?"active":""}>{t('navbar.mobileApp')}</a>
          <a href='#review' onClick={() => setmenu("customer-review")} className={menu === "customer-review"?"active":""}>{t('navbar.customers')}</a>
          <a href='#about-us' onClick={() => setmenu("about-us")} className={menu === "about-us"?"active":""}>{t('navbar.aboutUs')}</a>
          <a href='#footer' onClick={() => setmenu("contact-us")} className={menu === "contact-us"?"active":""}>{t('navbar.contactUs')}</a>
        </ul>
      )}

      <div className="navbar-right">
        {/* Language switcher button */}
        <button className="language-switcher" onClick={toggleLanguage}>
          {t('navbar.language')}
        </button>
        <div className="navbar-search-icon" onClick={handleCartClick}>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount()===0? "": "dot"}></div>
        </div>
        {/* agar button loken h toh */}
        {!token?<button onClick={()=> setShowLogin(true)}>{t('navbar.signIn')}</button>
        :<div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate('/ProfilePage')}><img src={assets.profile_icon2} alt=""  /><p>{t('navbar.myAccount')}</p></li>
              <hr />
              <li onClick={() => navigate('/myorders')}><img src={assets.order_icon} alt="" /><p>{t('navbar.orders')}</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon2} alt=""  /><p>{t('navbar.logout')}</p></li>
            </ul>
        </div>}
      </div>
    </div>
  )
} 

export default Navbar