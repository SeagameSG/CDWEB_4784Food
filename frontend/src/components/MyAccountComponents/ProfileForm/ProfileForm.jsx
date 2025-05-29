import React, { useState, useEffect } from 'react';
import './ProfileForm.css';
import { assets } from '../../../assets/assets';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileForm = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(assets.default_profile_icon);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' hoặc 'password'
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
      
      const response = await axios.get('http://localhost:3000/api/user/profile', {
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
        'http://localhost:3000/api/user/profile/update',
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
  
  const handleResetPassword = async (e) => {
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
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('profileForm.errors.notLoggedIn'));
        return;
      }
      
      const response = await axios.post(
        'http://localhost:3000/api/user/profile/reset-password',
        {
          currentPassword: passwordData.currentPassword,
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
        setPasswordStrength(0);
      } else {
        setError(response.data.message || t('resetPassword.errors.resetFailed'));
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(t('resetPassword.errors.resetFailed'));
    } finally {
      setLoading(false);
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
      
      {activeTab === 'profile' ? (
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
      ) : (
        <div className="password-reset-section">
          <h3>{t('resetPassword.title')}</h3>
          
          <form onSubmit={handleResetPassword}>
            <div className="form-row">
              <div className="input-group">
                <label>{t('resetPassword.currentPassword')}</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('resetPassword.currentPassword')}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>{t('resetPassword.newPassword')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('resetPassword.newPassword')}
                  required
                />
                
                {/* Password Strength Bar */}
                <div className="password-strength-container">
                  <div className="password-strength-bar">
                    <div 
                      className="bar" 
                      style={{ 
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: 
                          passwordStrength === 1 ? 'red' : 
                          passwordStrength === 2 ? 'orange' : 
                          passwordStrength >= 3 ? 'green' : '#ddd' 
                      }}
                    ></div>
                  </div>
                  <p className={`strength-label level-${passwordStrength}`}>
                    {getStrengthLabel()}
                  </p>
                </div>
              </div>
              
              <div className="input-group">
                <label>{t('resetPassword.confirmPassword')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('resetPassword.confirmPassword')}
                  required
                />
              </div>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <button 
              type="submit" 
              className="update-btn" 
              disabled={loading}
            >
              {loading ? t('resetPassword.processing') : t('resetPassword.resetButton')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;