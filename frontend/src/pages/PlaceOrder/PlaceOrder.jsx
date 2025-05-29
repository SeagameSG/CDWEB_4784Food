import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const PlaceOrder = () => {
  const { t } = useTranslation();
  const { getTotalCartAmount, getTotalWithDiscount, token, food_list, cartItems, url, couponDiscount, markCouponAsUsed } = useContext(StoreContext);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); // Default payment method

  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "VietNam",
    phone: "",
    coordinates: {lat: 10.8685, lng: 106.7800}
  });

  const navigate = useNavigate();

  const SHIPPING_FEE = 25000;

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/api/address/list`, {}, { headers: { token } });
      if (response.data.success) {
        setUserAddresses(response.data.data);
        
        // Set default address as selected if any
        const defaultAddress = response.data.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (response.data.data.length > 0) {
          setSelectedAddressId(response.data.data[0]._id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    } else {
      navigate("/cart");
    }
  }, [token]);

  useEffect(() => {
    if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [getTotalCartAmount()]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({...data, [name]: value}));
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(t('placeOrder.errors.locationError'));
        }
      );
    } else {
      toast.error(t('placeOrder.errors.browserNotSupported'));
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = {...item};
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let selectedAddress;
    let orderCoordinates;
    
    const currentLanguage = i18next.language;
    // Convert to VNPay expected format: 'vn' for Vietnamese, 'en' for English
    const vnpLanguage = currentLanguage === 'vi' ? 'vn' : 'en';
    
    const totalWithDiscount = getTotalWithDiscount();
    const finalAmount = totalWithDiscount + SHIPPING_FEE;
    
    if (selectedAddressId) {
      selectedAddress = userAddresses.find(addr => addr._id === selectedAddressId);
      if (!selectedAddress) {
        toast.error(t('placeOrder.errors.selectAddress'));
        return;
      }
      
      const addressData = {
        firstname: selectedAddress.name.split(' ')[0],
        lastname: selectedAddress.name.split(' ').slice(1).join(' '),
        email: "",  // Email is not stored in address
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipcode: selectedAddress.zipcode,
        country: selectedAddress.country,
        phone: selectedAddress.phone
      };
      
      orderCoordinates = selectedAddress.coordinates;
      
      let orderData = {
        address: addressData,
        items: orderItems,
        amount: finalAmount,
        coordinates: orderCoordinates,
        language: vnpLanguage
      };
      
      try {
        let response;
        
        if (paymentMethod === 'vnpay') {
          // VNPAY payment
          response = await axios.post(url + "/api/order/place-vnpay", orderData, {headers: {token}});
          
          if (response.data.success) {
            if (couponDiscount.appliedCoupon) {
              await markCouponAsUsed();
            }
            window.location.replace(response.data.paymentUrl);
          } else {
            toast.error(t('placeOrder.errors.orderError'));
          }
        } else {
          // Cash on delivery
          response = await axios.post(url + "/api/order/place-cod", orderData, {headers: {token}});
          
          if (response.data.success) {
            if (couponDiscount.appliedCoupon) {
              await markCouponAsUsed();
            }
            toast.success(t('placeOrder.success.orderPlaced'));
            navigate(`/trackorder?success=true&orderId=${response.data.orderId}`);
          } else {
            toast.error(response.data.message || t('placeOrder.errors.orderError'));
          }
        }
      } catch (error) {
        console.error("Error placing order:", error);
        toast.error(t('placeOrder.errors.orderError'));
      }
    } else {
      const newAddress = data;
      orderCoordinates = newAddress.coordinates;
      
      let orderData = {
        address: newAddress,
        items: orderItems,
        amount: finalAmount,
        coordinates: orderCoordinates,
        language: vnpLanguage
      };
      
      try {
        let response;
        
        if (paymentMethod === 'vnpay') {
          // VNPAY payment
          response = await axios.post(url + "/api/order/place-vnpay", orderData, {headers: {token}});
          
          if (response.data.success) {
            if (couponDiscount.appliedCoupon) {
              await markCouponAsUsed();
            }
            window.location.replace(response.data.paymentUrl);
          } else {
            toast.error(t('placeOrder.errors.orderError'));
          }
        } else {
          // Cash on delivery
          response = await axios.post(url + "/api/order/place-cod", orderData, {headers: {token}});
          
          if (response.data.success) {
            if (couponDiscount.appliedCoupon) {
              await markCouponAsUsed();
            }
            toast.success(t('placeOrder.success.orderPlaced'));
            navigate(`/trackorder?success=true&orderId=${response.data.orderId}`);
          } else {
            toast.error(t('placeOrder.errors.orderError'));
          }
        }
      } catch (error) {
        console.error("Error placing order:", error);
        toast.error(t('placeOrder.errors.orderError'));
      }
    }
  };

  const PaymentMethodSelection = ({ paymentMethod, onChange, t }) => {
    return (
      <div className="payment-method-selection">
        <h3>{t('placeOrder.paymentMethod')}</h3>
        <div className="payment-options">
          <div 
            className={`payment-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
            onClick={() => onChange('vnpay')}
          >
            <input 
              type="radio" 
              id="vnpay" 
              name="paymentMethod" 
              value="vnpay"
              checked={paymentMethod === 'vnpay'}
              onChange={() => onChange('vnpay')}
            />
            <label htmlFor="vnpay">{t('placeOrder.vnpay')}</label>
          </div>
          <div 
            className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
            onClick={() => onChange('cod')}
          >
            <input 
              type="radio" 
              id="cod" 
              name="paymentMethod" 
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => onChange('cod')}
            />
            <label htmlFor="cod">{t('placeOrder.payOnDelivery')}</label>
          </div>
        </div>
        <p className="payment-info">
          {paymentMethod === 'vnpay' 
            ? t('placeOrder.paymentInfo.vnpay')
            : t('placeOrder.paymentInfo.cod')
          }
        </p>
      </div>
    );
  };

  return (
    <div>
      <form className='place-order' onSubmit={placeOrder}>
        <div className="place-order-left">
          <p className="title">{t('placeOrder.shippingInfo')}</p>
          
          {/* Saved Addresses Section */}
          {!loading && userAddresses.length > 0 && (
            <div className="saved-addresses">
              <h3>{t('placeOrder.savedAddresses')}</h3>
              <div className="address-selection">
                {userAddresses.map((address) => (
                  <div 
                    key={address._id} 
                    className={`address-option ${selectedAddressId === address._id ? 'selected' : ''}`}
                    onClick={() => handleAddressSelect(address._id)}
                  >
                    <div className="address-option-checkbox">
                      <input 
                        type="radio" 
                        name="addressId" 
                        checked={selectedAddressId === address._id}
                        onChange={() => handleAddressSelect(address._id)}
                      />
                    </div>
                    <div className="address-option-details">
                      <p className="address-name">{address.name} {address.isDefault && <span className="default-badge">{t('placeOrder.defaultBadge')}</span>}</p>
                      <p>{address.street}, {address.city}</p>
                      <p>{address.state}, {address.country}, {address.zipcode}</p>
                      <p>{address.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="use-new-address">
                <label htmlFor="useNewAddress" className="new-address-label">
                  <input 
                    type="radio" 
                    name="addressId" 
                    id="useNewAddress" 
                    checked={!selectedAddressId}
                    onChange={() => setSelectedAddressId(null)}
                  />
                  <span className="plus-icon">+</span>
                  <span>{t('placeOrder.useNewAddress')}</span>
                </label>
              </div>
            </div>
          )}
          
          {/* New Address Form */}
          {(!userAddresses.length || !selectedAddressId) && (
            <div className="new-address-form">
              <div className="multi-fields">
                <input name='firstname' onChange={onChangeHandler} value={data.firstname} type="text" placeholder={t('placeOrder.firstName')} required />
                <input name='lastname' onChange={onChangeHandler} value={data.lastname} type="text" placeholder={t('placeOrder.lastName')} required />
              </div>
              <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder={t('placeOrder.email')} required />
              <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder={t('placeOrder.street')} required />
              <div className="multi-fields">
                <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder={t('placeOrder.city')} required />
                <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder={t('placeOrder.state')} required />
              </div>
              <div className="multi-fields">
                <input name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder={t('placeOrder.zipCode')} required />
                <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder={t('placeOrder.country')} required />
              </div>
              <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder={t('placeOrder.phone')} required />
              
              <div className="location-section">
                <div className="coordinates-display">
                  <p>{t('placeOrder.coordinates')} {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}</p>
                </div>
                <button type="button" className="get-location-btn" onClick={getUserLocation}>
                  {t('placeOrder.getCurrentLocation')}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="place-order-right">
          <div className="cart-total">
            <h2>{t('placeOrder.orderTotal')}</h2>
            <div>
              <div className="cart-total-details">
                <p>{t('placeOrder.price')}</p>
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
                <p>{t('placeOrder.shipping')}</p>
                <p>₫{getTotalCartAmount() === 0 ? 0 : SHIPPING_FEE}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>{t('cart.total')}</b>
                <b>₫{getTotalCartAmount() === 0 ? 0 : getTotalWithDiscount() + SHIPPING_FEE}</b>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <PaymentMethodSelection 
              paymentMethod={paymentMethod} 
              onChange={handlePaymentMethodChange} 
              t={t} 
            />
            
            <button type='submit'>{t('placeOrder.orderNow')}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;