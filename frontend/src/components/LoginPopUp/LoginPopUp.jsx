import React, { useState } from 'react'
import './LoginPopUp.css';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios'
// import { useEffect } from 'react';

const LoginPopUp = ({setShowLogin}) => {

   const {url, setToken} = useContext(StoreContext);

   const [currState, setCurrState] = useState("Login");
   // to save name email and password
   const [data, setData] = useState({
      name:"",
      email:"",
      password:""
   });

   // to take data from input to save variable
   const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setData(data => ({...data,[name]:value}))
   }

   // for user login 
   const onLogin = async(event) => {
      event.preventDefault()
      let newUrl = url;
      if (currState==="Login") {
         newUrl += "/api/user/login"
      } 
      else{
         newUrl += "/api/user/register"
      }

      // api call
      const response = await axios.post(newUrl,data);
      if (response.data.success) {
         setToken(response.data.token);
         localStorage.setItem("token", response.data.token);
         setShowLogin(false)
      }
      else
      {
         alert(response.data.message)
      }

   }

   

   // useEffect(() => {
   //    console.log(data);
   // },[data])
     
  return (
    <div className='login-pop-up'>
      <form className='login-pop-up-container' onSubmit={onLogin}>
         <div className='login-pop-up-title'>
            <h2>{currState}</h2>  
            <img onClick={() => setShowLogin(false) } src={assets.cross_icon} alt="" />
         </div>
         <div className='login-popup-inputs'>
            {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Nhập tên của bạn' required />}
            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Nhập email của bạn' required />
            <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Nhập mật khẩu của bạn' required />
         </div>
         <button type='submit'>{currState==="Sign Up"?"Sign Up":"Login"}</button>
         <div className='login-popup-condition'>
            <input type="checkbox" required />
            <p>Bằng cách tiếp tục, tôi đồng ý với các điều khoản sử dụng và chính sách bảo mật.</p>
         </div>
         {  currState==="Login"
            ?<p>Tạo tài khoản mới?<span onClick={() => setCurrState("Sign Up")}>Bấm vào đây</span></p>
            :<p>Đã có tài khoản<span onClick={() => setCurrState("Login")}>Đăng nhập tại đây</span></p>
         }
      </form>
    </div>
  )
}

export default LoginPopUp
