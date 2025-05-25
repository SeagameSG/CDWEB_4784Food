import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';
import crypto from 'crypto';
import querystring from 'qs';
import moment from 'moment';
import dateFormat from 'date-format';
import moment2 from 'moment-timezone';
const timeZone = 'Asia/Ho_Chi_Minh';
moment2().tz(timeZone);

dotenv.config();

// Global variables to store order data between VNPAY requests
let globalOrderData = {};

// Function to sort parameters for VNPAY
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createVnpayPaymentUrl = async (req, res) => {
    try {
        // Get IP address
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        // VNPAY Configuration
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        // Create order
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false
        });
        await newOrder.save();

        // Store order data for later use in return handler
        globalOrderData[newOrder.userId] = {
            userId: req.body.userId,
            items: req.body.items
        };

        // Create date format for VNPAY
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = dateFormat(date, 'HHmmss');

        // Create VNPAY parameters
        let vnpParams = {};
        vnpParams['vnp_Version'] = '2.1.0';
        vnpParams['vnp_Command'] = 'pay';
        vnpParams['vnp_TmnCode'] = tmnCode;
        vnpParams['vnp_Locale'] = req.body.language || 'vn';
        vnpParams['vnp_CurrCode'] = 'VND';
        vnpParams['vnp_TxnRef'] = orderId;
        vnpParams['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnpParams['vnp_OrderType'] = 'other';
        vnpParams['vnp_Amount'] = Math.round(req.body.amount * 100); // Convert to VND
        vnpParams['vnp_ReturnUrl'] = `${returnUrl}?orderId=${newOrder.userId}`;
        vnpParams['vnp_IpAddr'] = ipAddr;
        vnpParams['vnp_CreateDate'] = createDate;

        // Sort and create signature
        vnpParams = sortObject(vnpParams);
        const signData = querystring.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnpParams['vnp_SecureHash'] = signed;

        // Generate full payment URL
        const paymentUrl = vnpUrl + '?' + querystring.stringify(vnpParams, { encode: false });

        // Return payment URL to client
        res.json({
            success: true,
            paymentUrl: paymentUrl,
            orderId: newOrder.userId
        });

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Payment URL generation failed"});
    }
}

const vnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;
        const orderId = vnpParams.orderId;

        // Verify hash
        const secureHash = vnpParams['vnp_SecureHash'];

        // Clone params for verification
        let verifyParams = {...vnpParams};
        delete verifyParams['vnp_SecureHash'];
        delete verifyParams['vnp_SecureHashType'];
        delete verifyParams['orderId']; // Our custom param, not from VNPAY

        // Sort params
        verifyParams = sortObject(verifyParams);

        // Verify signature
        const secretKey = process.env.VNP_HASH_SECRET;
        const signData = querystring.stringify(verifyParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

        if (secureHash === signed) {
            // Successful payment
            const responseCode = vnpParams['vnp_ResponseCode'];

            if (responseCode === '00') {
                // Payment successful
                await orderModel.findByIdAndUpdate(orderId, { payment: true });

                // Clear cart if we saved this information
                if (globalOrderData[orderId] && globalOrderData[orderId].userId) {
                    await userModel.findByIdAndUpdate(globalOrderData[orderId].userId, {cartData: {}});
                    // Cleanup stored data
                    delete globalOrderData[orderId];
                }

                // Redirect to frontend with success
                res.redirect(`${frontend_url}/verify?success=true&orderId=${orderId}`);
            } else {
                // Payment failed
                await orderModel.findByIdAndDelete(orderId);
                res.redirect(`${frontend_url}/verify?success=false&orderId=${orderId}`);
            }
        } else {
            // Invalid signature
            await orderModel.findByIdAndDelete(orderId);
            res.redirect(`${frontend_url}/verify?success=false&orderId=${orderId}&error=invalid_signature`);
        }
    } catch (error) {
        console.log(error);
        const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontend_url}/verify?success=false&error=server_error`);
    }
}

const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment: true});
            res.json({success: true, message: "Payment Successfully"});
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success: false, message: "Payment failed"});
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Internal Server Error"});
    }
}

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId: req.body.userId});
        res.json({success: true, data: orders});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Internal Server Error"});
    }
}

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success: true, data: orders});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Internal Server Error"});
    }
}

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status});
        res.json({success: true, message: "Status Updated Successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Internal Server Error"});
    }
}

export {createVnpayPaymentUrl, vnpayReturn, verifyOrder, userOrders, listOrders, updateStatus}