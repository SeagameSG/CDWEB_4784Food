import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MyOrders = () => {
    const { t } = useTranslation();
    const {url, token} = useContext(StoreContext);
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
        // save user data
        setData(response.data.data);
    }

    const goToTrackOrder = (orderId) => {
        navigate(`/trackorder?orderId=${orderId}`);
    }

    useEffect(() =>{
        if (token) {
            fetchOrders();
        }
    },[token])

    const getPaymentMethodText = (order) => {
        if (order.paymentMethod === 'vnpay') {
            return t('order.paymentMethod.vnpay');
        } else {
            return t('order.paymentMethod.cod');
        }
    }

    const getPaymentStatusInfo = (order) => {
        if (order.payment) {
            return {
                text: t('order.paymentStatus.paid'),
                className: 'payment-status-paid'
            };
        } else {
            return {
                text: t('order.paymentStatus.unpaid'),
                className: 'payment-status-unpaid'
            };
        }
    }

  return (
    <div>
        <div className="my-orders">
            <h2>{t('order.title')}</h2>
            <div className="container">
                {data.map((order,index) => {
                    const paymentStatus = getPaymentStatusInfo(order);
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="" />
                            <div className="order-info">
                                <p className="order-items">{order.items.map((item,index) => {
                                    if (index===order.items.length-1) {
                                        return item.name+" X "+item.quantity
                                    }
                                    else{
                                        return item.name+" X "+item.quantity+", "
                                    }
                                })}</p>
                                <div className="order-details">
                                    <p>₫{order.amount}.00</p>
                                    <p>{t('order.items')} {order.items.length}</p>
                                    <p className="order-payment-method">{getPaymentMethodText(order)}</p>
                                    <p className={`order-payment-status ${paymentStatus.className}`}>
                                        {paymentStatus.text}
                                    </p>
                                </div>
                            </div>
                            <p className="order-status"><span>&#x25cf; </span><b>{order.status}</b></p>
                            <button 
                                onClick={() => goToTrackOrder(order._id)}
                                className="track-order-btn"
                            >
                                {t('order.trackOrder')}
                            </button>
                        </div>
                    )
                })}
                
                {data.length === 0 && (
                    <div className="no-orders">
                        <p>{t('order.noOrders')}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default MyOrders