const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const Order = require('../models/Order');

const vnp_TmnCode = 'YOUR_VNP_TMNCODE';
const vnp_HashSecret = 'YOUR_VNP_HASH_SECRET';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:3000/payment-success';

router.post('/create_payment', async (req, res) => {
    const { amount, orderId, orderDesc } = req.body;
    const ipAddr = req.ip;

    const tmnCode = vnp_TmnCode;
    const secretKey = vnp_HashSecret;
    const vnpUrl = vnp_Url;
    const returnUrl = vnp_ReturnUrl;

    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderIdVN = moment().format('HHmmss');

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderIdVN,
        vnp_OrderInfo: orderDesc,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
    res.json({ paymentUrl });
});

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

module.exports = router;

// --- FRONTEND (React)
// 📁 frontend/src/pages/Checkout.jsx
import { useEffect } from 'react';
import axios from 'axios';

const Checkout = ({ cart }) => {
    const handlePayment = async () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const res = await axios.post('http://localhost:5000/api/payment/create_payment', {
            amount: total,
            orderId: 'ORDER123',
            orderDesc: 'Đơn hàng món ăn'
        });
        window.location.href = res.data.paymentUrl;
    };

    return (
        <div>
            <h2>Thanh toán</h2>
            <button onClick={handlePayment}>Thanh toán VNPay</button>
        </div>
    );
};

export default Checkout;
