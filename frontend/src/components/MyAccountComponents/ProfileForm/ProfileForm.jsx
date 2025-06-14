import React, { useState, useEffect, useContext } from 'react';
import './ProfileForm.css';
import { assets } from '../../../assets/assets';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../../context/StoreContext';

const ProfileForm = () => {
  const { t } = useTranslation();
  const { url } = useContext(StoreContext);
  const [image, setImage] = useState(assets.default_profile_icon);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', or 'reset'
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    coordinates: { lat: 10.8685, lng: 106.7800 }
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');

  // For OTP password change
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  // Lấy thông tin người dùng khi component được tải
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('profileForm.errors.notLoggedIn'));
        return;
      }
      
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });
      
      if (response.data.success) {
        const user = response.data.user;
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          coordinates: user.coordinates || { lat: 10.8685, lng: 106.7800 }
        });
      } else {
        toast.error(t('profileForm.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('profileForm.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('profileForm.errors.notLoggedIn'));
        return;
      }
      
      const response = await axios.post(
        `${url}/api/user/profile/update`,
        {
          name: userData.name,
          phone: userData.phone,
          gender: userData.gender,
          coordinates: userData.coordinates
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(t('profileForm.success.profileUpdated'));
      } else {
        toast.error(response.data.message || t('profileForm.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profileForm.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Kiểm tra độ mạnh của mật khẩu
    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^A-Za-z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };
  
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return t('resetPassword.passwordStrength.weak');
    if (passwordStrength === 2) return t('resetPassword.passwordStrength.good');
    return t('resetPassword.passwordStrength.strong');
  };
  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('profileForm.errors.notLoggedIn'));
        return;
      }
      
      const response = await axios.post(
        `${url}/api/user/profile/request-otp`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(t('resetPassword.otpSent'));
        setOtpSent(true);
      } else {
        toast.error(response.data.message || t('resetPassword.errors.otpSendFailed'));
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast.error(t('resetPassword.errors.otpSendFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyAndChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('resetPassword.errors.passwordsDoNotMatch'));
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError(t('resetPassword.errors.passwordTooShort'));
      return;
    }
    
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('profileForm.errors.notLoggedIn'));
        return;
      }
      
      const response = await axios.post(
        `${url}/api/user/profile/change-password-with-otp`,
        {
          otp,
          newPassword: passwordData.newPassword
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(t('resetPassword.success'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setOtp('');
        setOtpSent(false);
        setPasswordStrength(0);
      } else {
        setError(response.data.message || t('resetPassword.errors.resetFailed'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(t('resetPassword.errors.resetFailed'));
    } finally {
      setVerifying(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      coordinates: {
        ...userData.coordinates,
        [name]: parseFloat(value)
      }
    });
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Preview uploaded image
    }
  };

  return (
    <div className="profile-form">
      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          {t('profileForm.tabs.profile')}
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          {t('profileForm.tabs.password')}
        </button>
      </div>
      
      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-left">
            <div className="add-image-upload">
              <label htmlFor="imageUpload" className="upload-label">
                <img src={image} alt="Profile" />
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </div>
          </div>

          <form className="profile-right" onSubmit={handleProfileUpdate}>
            <div className="form-row">
              <div className="input-group">
                <label>{t('profileForm.fullName')}</label>
                <input 
                  type="text" 
                  name="name"
                  value={userData.name} 
                  onChange={handleInputChange}
                  placeholder={t('profileForm.fullName')}
                  required 
                />
              </div>
              <div className="input-group">
                <label>{t('profileForm.email')}</label>
                <input 
                  type="email" 
                  value={userData.email} 
                  placeholder={t('profileForm.email')}
                  disabled 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>{t('profileForm.phone')}</label>
                <input 
                  type="text" 
                  name="phone"
                  value={userData.phone} 
                  onChange={handleInputChange}
                  placeholder={t('profileForm.phone')} 
                />
              </div>
              <div className="input-group">
                <label>{t('profileForm.gender')}</label>
                <select name="gender" value={userData.gender} onChange={handleInputChange}>
                  <option value="">{t('profileForm.selectGender')}</option>
                  <option value="male">{t('profileForm.male')}</option>
                  <option value="female">{t('profileForm.female')}</option>
                  <option value="other">{t('profileForm.other')}</option>
                </select>
              </div>
            </div>
            
            <div className="form-row coordinates-row">
              <div className="input-group">
                <label>{t('profileForm.latitude')}</label>
                <input 
                  type="number" 
                  name="lat"
                  value={userData.coordinates.lat} 
                  onChange={handleCoordinateChange}
                  step="0.0001"
                  min="-90"
                  max="90"
                  placeholder="10.8685"
                />
              </div>
              <div className="input-group">
                <label>{t('profileForm.longitude')}</label>
                <input 
                  type="number" 
                  name="lng"
                  value={userData.coordinates.lng} 
                  onChange={handleCoordinateChange}
                  step="0.0001"
                  min="-180"
                  max="180"
                  placeholder="106.7800"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="update-btn" 
              disabled={loading}
            >
              {loading ? t('profileForm.updating') : t('profileForm.updateChanges')}
            </button>
          </form>
        </div>
      )}
      
      {activeTab === 'password' && (
        <div className="password-change-section">
          <h3>{t('changePassword.title')}</h3>
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <p className="info-text">{t('changePassword.otpInfo')}</p>
              <button 
                type="submit" 
                className="update-btn" 
                disabled={loading}
              >
                {loading ? t('common.loading') : t('changePassword.sendOtp')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndChangePassword}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="input-group">
                <label>{t('changePassword.otp')}</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t('changePassword.otpPlaceholder')}
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>{t('changePassword.newPassword')}</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('changePassword.newPasswordPlaceholder')}
                  required 
                />
                
                {passwordData.newPassword && (
                  <div className="password-strength-container">
                    <div className="password-strength-bar">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${passwordStrength * 25}%`,
                          backgroundColor: 
                            passwordStrength === 1 ? 'red' : 
                            passwordStrength === 2 ? 'orange' : 
                            'green'
                        }}
                      ></div>
                    </div>
                    <span className={`strength-label level-${passwordStrength}`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="input-group">
                <label>{t('changePassword.confirmPassword')}</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('changePassword.confirmPasswordPlaceholder')}
                  required 
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => setOtpSent(false)}
                >
                  {t('common.back')}
                </button>
                <button 
                  type="submit" 
                  className="update-btn" 
                  disabled={verifying || passwordStrength < 2}
                >
                  {verifying ? t('common.loading') : t('changePassword.changeButton')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileForm;