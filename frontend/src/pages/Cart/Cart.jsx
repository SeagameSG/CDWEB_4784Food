import React, { useContext, useState } from 'react'
import './Cart.css';
import {StoreContext} from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Cart = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    getTotalWithDiscount,
    applyCoupon,
    couponDiscount,
    resetCoupon,
    url
  } = useContext(StoreContext);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const SHIPPING_FEE = 25000;

  const navigate = useNavigate();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('cart.errors.emptyCoupon'));
      return;
    }

    setLoading(true);
    
    const result = await applyCoupon(couponCode);
    
    if (result.success) {
      toast.success(t('cart.success.couponApplied'));
    } else {
      toast.error(result.message || t('cart.errors.invalidCoupon'));
      resetCoupon();
    }
    
    setLoading(false);
  };

  const handleRemoveCoupon = () => {
    resetCoupon();
    setCouponCode('');
    toast.info(t('cart.couponRemoved'));
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>{t('cart.items')}</p>
          <p>{t('cart.title')}</p>
          <p>{t('cart.price')}</p>
          <p>{t('cart.quantity')}</p>
          <p>{t('cart.total')}</p>
          <p>{t('cart.remove')}</p>
        </div>
        <br />
        <hr />
        {food_list.map((item,index) => {
          if(cartItems[item._id]>0){
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item' key={item._id}> 
                  <img src={url+"/images/"+item.image} alt="" />
                  <p>{item.name}</p>
                  <p>₫{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₫{item.price*cartItems[item._id]}</p>
                  <p onClick={()=> removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            )
          }
        })}
      </div>
      <div className="cart-button">
        <div className="cart-total">
          <h2>{t('cart.cartTotals')}</h2>
          <div>
            <div className="cart-total-details">
              <p>{t('cart.subtotal')}</p>
              <p>₫{getTotalCartAmount()}</p>
            </div>
            <hr />
            {couponDiscount.appliedCoupon && (
              <>
                <div className="cart-total-details coupon-discount">
                  <p>
                    {t('cart.discount')} ({couponDiscount.appliedCoupon.discountPercentage}% 
                    {couponDiscount.affectedCategories !== "all items" 
                      ? ` ${t('cart.for')} ${couponDiscount.affectedCategories}` 
                      : ''})
                  </p>
                  <p>-₫{couponDiscount.discountAmount}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <p>{t('cart.deliveryFee')}</p>
              <p>₫{getTotalCartAmount()===0?0:SHIPPING_FEE}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>{t('cart.total')}</b>
              <b>₫{getTotalCartAmount()===0?0:getTotalWithDiscount() + SHIPPING_FEE}</b>
            </div>
          </div>
          <button 
            onClick={() => navigate("/order")}
            disabled={getTotalCartAmount() === 0}
            className={getTotalCartAmount() === 0 ? "disabled-btn" : ""}
          >
            {t('cart.checkoutButton')}
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>{t('cart.promoCodeTitle')}</p>
            <div className="cart-promocode-input">
              <input 
                type="text" 
                placeholder={t('cart.promoCodePlaceholder')} 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponDiscount.appliedCoupon || loading}
              />
              {!couponDiscount.appliedCoupon ? (
                <button 
                  onClick={handleApplyCoupon} 
                  disabled={loading}
                  className={loading ? "loading-btn" : ""}
                >
                  {loading ? t('cart.applying') : t('cart.applyButton')}
                </button>
              ) : (
                <button 
                  onClick={handleRemoveCoupon} 
                  className="remove-coupon-btn"
                >
                  {t('cart.removeCoupon')}
                </button>
              )}
            </div>
            {couponDiscount.appliedCoupon && (
              <div className="applied-coupon-info">
                <p>
                  {t('cart.appliedCoupon')}: 
                  <span className="coupon-code">{couponDiscount.appliedCoupon.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart