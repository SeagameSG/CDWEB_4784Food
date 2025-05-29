import React, { useState, useContext } from 'react';
import './ProfilePage.css';
import { assets } from '../../assets/assets';
import ProfileForm from '../../components/MyAccountComponents/ProfileForm/ProfileForm';
import MyAddress from '../../components/MyAccountComponents/MyAddress/MyAddress';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState("profile"); // Manage which section to show
  const { t } = useTranslation();

  const {token,setToken} = useContext(StoreContext);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/")
  }

  return (
    <div className='profile-page'>
      {/* <h2>{t('profilePage.myAccount')}</h2> */}

      {/* Fixed Left Sidebar */}
      <div className="profile-page-left">
        <div className="sidebar">
          <div className="profile-page-left-option" onClick={() => setActiveSection("profile")}>
            <img src={assets.profile_icon2} alt="Profile Icon" />
            <p>{t('profilePage.profileInformation')}</p>
          </div>
          <div className="profile-page-left-option" onClick={() => setActiveSection("address")}>
            <img src={assets.address_icon} alt="Address Icon" />
            <p>{t('profilePage.manageAddress')}</p>
          </div>
          <div className="profile-page-left-option" onClick={logout}>
            <img src={assets.logout_icon2} alt="Logout Icon" />
            <p>{t('profilePage.logout')}</p>
          </div>
        </div>
      </div>

      {/* Right Side Dynamic Content */}
      <div className="profile-page-right">
        {activeSection === "profile" && <ProfileForm/>}
        {activeSection === "address" && <MyAddress/>}
      </div>
    </div>
  );
};

export default ProfilePage;