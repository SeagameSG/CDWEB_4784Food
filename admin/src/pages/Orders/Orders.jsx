import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from "axios";
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    orderId: null,
    newStatus: null
  });

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list", { 
        headers: { token: localStorage.getItem('token') } 
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error(`Error fetching orders: ${error.message}`);
    }
  };

  // Function cập nhật trạng thái đơn hàng
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/admin/update-status", 
        {
          orderId,
          status: event.target.value,
        }, 
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  // Mở popup
  const openPaymentConfirmation = (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    
    if (order.paymentMethod === 'vnpay' && order.payment) {
      toast.info("Cannot change payment status for completed VNPAY payments");
      return;
    }

    if ((newStatus && order.payment) || (!newStatus && !order.payment)) {
      return;
    }

    setConfirmPopup({
      isOpen: true,
      orderId,
      newStatus
    });
  }

  // Xác nhận thay đổi trạng thái thanh toán
  const confirmPaymentChange = async () => {
    try {
      const { orderId, newStatus } = confirmPopup;
      
      const response = await axios.post(
        url + "/api/order/admin/update-payment", 
        {
          orderId,
          paymentStatus: newStatus
        }, 
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Payment status updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(`Error updating payment status: ${error.message}`);
    } finally {
      closeConfirmPopup();
    }
  };

  const closeConfirmPopup = () => {
    setConfirmPopup({
      isOpen: false,
      orderId: null,
      newStatus: null
    });
  }

  const goToTrackOrder = (orderId) => {
    navigate(`/trackorder?orderId=${orderId}`);
  }

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const getPaymentMethodText = (method) => {
    return method === 'vnpay' ? 'VNPAY' : 'Cash on Delivery';
  }

  return (
    <div className="order add">
      <h3>Order Management</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <div className="order-item-info">
              <img src={assets.parcel_icon} alt="Parcel Icon" />
              <div>
                <p className="order-item-food">
                  {order.items.map(item => `${item.name} X ${item.quantity}`).join(", ")}
                </p>
                <p className='order-item-name'>{order.address.firstname+" "+order.address.lastname}</p>
                <div className='order-item-address'>
                  <p>{order.address.street+","}</p>
                  <p>{order.address.city+", "+order.address.state+", "+order.address.country+", "+order.address.zipcode}</p>
                </div>
                <p className='order-item-phone'>{order.address.phone}</p>
                <div className="order-payment-info">
                  <p><strong>Payment Method:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
                  <p className={`payment-status ${order.payment ? 'paid' : 'unpaid'}`}>
                    <strong>Payment Status:</strong> {order.payment ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
              <p><strong>Items:</strong> {order.items.length}</p>
              <p><strong>Amount:</strong> ₫{order.amount}.00</p>
            </div>
            <div className="order-actions">
              <div className="action-group">
                <label>Order Status:</label>
                <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              
              <div className="action-group">
                <label>Payment Status:</label>
                <div className="payment-toggle">
                  <button 
                    className={`toggle-btn ${order.payment ? 'active' : ''}`}
                    onClick={() => openPaymentConfirmation(order._id, true)}
                    disabled={order.payment || (order.paymentMethod === 'vnpay' && order.payment)}
                  >
                    Paid
                  </button>
                  <button 
                    className={`toggle-btn ${!order.payment ? 'active' : ''}`}
                    onClick={() => openPaymentConfirmation(order._id, false)}
                    disabled={!order.payment || (order.paymentMethod === 'vnpay' && order.payment)}
                  >
                    Unpaid
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => goToTrackOrder(order._id)}
                className="track-order-btn"
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* Popup xác nhận thay đổi trạng thái thanh toán */}
      {confirmPopup.isOpen && confirmPopup.orderId && (
        <div className="payment-confirm-overlay">
          <div className="payment-confirm-popup">
            <h4>Confirm Payment Status Change</h4>
            <p>
              Are you sure you want to change the payment status to
              <span className={confirmPopup.newStatus ? 'status-paid' : 'status-unpaid'}>
                {confirmPopup.newStatus ? ' PAID' : ' UNPAID'}
              </span>?
            </p>
            <p className="warning-text">This action cannot be reversed.</p>
            <div className="confirm-actions">
              <button 
                className="confirm-btn confirm-yes" 
                onClick={confirmPaymentChange}
              >
                Yes, Confirm
              </button>
              <button 
                className="confirm-btn confirm-no" 
                onClick={closeConfirmPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;