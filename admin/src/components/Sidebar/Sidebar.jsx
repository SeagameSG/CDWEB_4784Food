import React from 'react'
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option">
            <img src={assets.home_icon} alt="" />
            <p>Home</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
            <img src={assets.cart_icon} alt="" />
            <p>Orders</p>
        </NavLink>
        <NavLink to='/coupons' className="sidebar-option">
            <img src={assets.coupon_icon} alt="" />
            <p>Coupons</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
