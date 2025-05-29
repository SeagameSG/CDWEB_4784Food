import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const userAuthMiddleware = async (req, res, next) => {
    // Kiểm tra token tồn tại
    const token = req.headers.token;
    if (!token) {
        return res.json({success: false, message: "Authorization token required"});
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await userModel.findById(id).select('_id');
        next();
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Request is not authorized"});
    }
};