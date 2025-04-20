import React, { useState, useContext } from 'react';
import './LoginPopUp.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import FacebookLogin from 'react-facebook-login';

const LoginPopUp = ({ setShowLogin }) => {
   const { url, setToken } = useContext(StoreContext);
   const [currState, setCurrState] = useState("Login");
   const [error, setError] = useState(null);

   const [data, setData] = useState({
      name: "",
      email: "",
      password: ""
   });

   const onChangeHandler = (e) => {
      const { name, value } = e.target;
      setData(data => ({ ...data, [name]: value }));
   };

   const onLogin = async (e) => {
      e.preventDefault();
      try {
         let newUrl = url + (currState === "Login" ? "/api/user/login" : "/api/user/register");
         const response = await axios.post(newUrl, data, {
            withCredentials: true // Cho phép nhận Cookie bảo mật
         });

         if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token); // tạm dùng localStorage
            setShowLogin(false);
         } else {
            setError(response.data.message);
         }
      } catch (err) {
         setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
         console.error(err);
      }
   };

   const responseFacebook = async (response) => {
      try {
         const res = await axios.post(`${url}/api/user/facebook-login`, {
            accessToken: response.accessToken,
            userID: response.userID
         }, {
            withCredentials: true
         });

         if (res.data.success) {
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            setShowLogin(false);
         } else {
            setError(res.data.message);
         }
      } catch (err) {
         setError("Đăng nhập Facebook thất bại.");
         console.error(err);
      }
   };

   return (
       <div className='login-pop-up'>
          <form className='login-pop-up-container' onSubmit={onLogin}>
             <div className='login-pop-up-title'>
                <h2>{currState}</h2>
                <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Đóng" />
             </div>

             <div className='login-popup-inputs'>
                {currState === "Login" ? null :
                    <input
                        name='name'
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        placeholder='Nhập tên của bạn'
                        required
                    />
                }
                <input
                    name='email'
                    onChange={onChangeHandler}
                    value={data.email}
                    type="email"
                    placeholder='Nhập email của bạn'
                    required
                />
                <input
                    name='password'
                    onChange={onChangeHandler}
                    value={data.password}
                    type="password"
                    placeholder='Nhập mật khẩu của bạn'
                    required
                />
             </div>

             <button type='submit'>{currState === "Sign Up" ? "Tạo tài khoản" : "Đăng nhập"}</button>

             <div className='login-popup-condition'>
                <input type="checkbox" required />
                <p>Bằng cách tiếp tục, tôi đồng ý với các điều khoản sử dụng và chính sách bảo mật.</p>
             </div>

             {error && <p className="login-error">{error}</p>}

             <div className='login-facebook'>
                <FacebookLogin
                    appId="YOUR_FACEBOOK_APP_ID" // ← Thay bằng App ID thật
                    autoLoad={false}
                    fields="name,email,picture"
                    callback={responseFacebook}
                    cssClass="facebook-login-button"
                    icon="fa-facebook"
                    textButton=" Đăng nhập bằng Facebook"
                />
             </div>

             <p>
                {currState === "Login"
                    ? <>Tạo tài khoản mới? <span onClick={() => { setCurrState("Sign Up"); setError(null); }}>Bấm vào đây</span></>
                    : <>Đã có tài khoản? <span onClick={() => { setCurrState("Login"); setError(null); }}>Đăng nhập tại đây</span></>
                }
             </p>
          </form>
       </div>
   );
};

export default LoginPopUp;
