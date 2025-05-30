import React, { useState } from 'react'
import './LoginPopUp.css';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LoginPopUp = ({setShowLogin}) => {
   const { t } = useTranslation();
   const {url, setToken} = useContext(StoreContext);
   const navigate = useNavigate();

   const [currState, setCurrState] = useState("Login");

   const [data, setData] = useState({
      name:"",
      email:"",
      password:"",
      coordinates: {lat: 10.8685, lng: 106.7800}
   });
   
   const [gettingLocation, setGettingLocation] = useState(false);

   const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setData(data => ({...data,[name]:value}))
   }

   const getUserLocation = () => {
      if (navigator.geolocation) {
         setGettingLocation(true);
         navigator.geolocation.getCurrentPosition(
            (position) => {
               setData(data => ({
                  ...data, 
                  coordinates: {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                  }
               }));
               setGettingLocation(false);
            },
            (error) => {
               console.error("Error getting location:", error);
               setGettingLocation(false);
               alert("Không thể lấy vị trí của bạn. Sử dụng vị trí mặc định.");
            }
         );
      } else {
         alert("Trình duyệt của bạn không hỗ trợ geolocation");
      }
   };

   // login
   const onLogin = async(event) => {
      event.preventDefault()
      let newUrl = url;
      if (currState==="Login") {
         newUrl += "/api/user/login"
      } 
      else{
         newUrl += "/api/user/register"
      }

      const response = await axios.post(newUrl,data);
      if (response.data.success) {
        const handleLoginSuccess = (userData) => {
          localStorage.setItem('token', userData.token);
          setToken(userData.token);
          
          setShowLogin(false);
          
          const intendedPath = sessionStorage.getItem('intendedPath');
          if (intendedPath) {
            sessionStorage.removeItem('intendedPath');
            navigate(intendedPath);
          } else {
            navigate('/');
          }
        };
        handleLoginSuccess(response.data)
         setShowLogin(false)
      }
      else
      {
         alert(response.data.message)
      }
   }
     
  return (
    <div className='login-pop-up'>
      <form className='login-pop-up-container' onSubmit={onLogin}>
         <div className='login-pop-up-title'>
            <h2>{currState === "Login" ? t('loginPopup.login') : t('loginPopup.signUp')}</h2>  
            <img onClick={() => setShowLogin(false) } src={assets.cross_icon} alt="" />
         </div>
         <div className='login-popup-inputs'>
            <input 
              name='email' 
              onChange={onChangeHandler} 
              value={data.email} 
              type="email" 
              placeholder={t('loginPopup.enterEmail')} 
              required 
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />
            <input 
              name='password' 
              onChange={onChangeHandler} 
              value={data.password} 
              type="password" 
              placeholder={t('loginPopup.enterPassword')} 
              required 
              minLength="8" 
            />
            {currState==="Login"?<></>:<>
              <input 
                name='name' 
                onChange={onChangeHandler} 
                value={data.name} 
                type="text" 
                placeholder={t('loginPopup.enterName')} 
                required 
                minLength="2"
              />
              {/* Location button for registration only */}
              <div className="location-input">
                  <button 
                     type="button" 
                     className="get-location-btn" 
                     onClick={getUserLocation}
                     disabled={gettingLocation}
                  >
                     {gettingLocation ? t('loginPopup.gettingLocation') : t('loginPopup.getCurrentLocation')}
                  </button>
                  {data.coordinates && (
                     <p className="coordinates-text">
                        {t('loginPopup.coordinates')} {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}
                     </p>
                  )}
               </div>
            </>}
         </div>
         <button type='submit'>{currState === "Sign Up" ? t('loginPopup.signUp') : t('loginPopup.login')}</button>
         <div className='login-popup-condition'>
            <input type="checkbox" required />
            <p>{t('loginPopup.termsConditions')}</p>
         </div>
         {currState==="Login"
            ?<p>{t('loginPopup.createAccount')}<span onClick={() => setCurrState("Sign Up")}>{t('loginPopup.clickHere')}</span></p>
            :<p>{t('loginPopup.haveAccount')}<span onClick={() => setCurrState("Login")}>{t('loginPopup.loginHere')}</span></p>
         }
      </form>
    </div>
  )
}

export default LoginPopUp