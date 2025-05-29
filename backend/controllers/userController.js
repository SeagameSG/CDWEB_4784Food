import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

// Đăng nhập
const loginUser = async(req,res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success:false, message:"User doesn't exist"})
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})
        }
        const token = createToken(user._id);
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

// token
const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}

// Đăng ký
const registerUser = async(req,res) => {
    const {name,password,email,coordinates} = req.body;
    try {
        // kiểm tra tồn tại
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }
        // validate email
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Invalid email"})
        }
        // password length
        if (password.length<8) {
            return res.json({success:false, message:"Password should be at least 8 characters"})
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);
        // tạo user
        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            coordinates: coordinates || {lat: 10.8685, lng: 106.7800}
        })
        // lưu
        const user =  await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"ERROR"})
    }
}

// Lấy thông tin người dùng
const getUserProfile = async(req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select('-password');
        if (!user) {
            return res.json({success: false, message: "User not found"});
        }
        res.json({success: true, user});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error fetching user profile"});
    }
}

// Cập nhật thông tin người dùng
const updateUserProfile = async(req, res) => {
    const {name, coordinates, gender, phone} = req.body;
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.json({success: false, message: "User not found"});
        }

        if (name) user.name = name;
        if (coordinates) user.coordinates = coordinates;
        if (gender) user.gender = gender;
        if (phone) user.phone = phone;

        await user.save();
        res.json({success: true, message: "Profile updated successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error updating profile"});
    }
}

// Đổi mật khẩu
const resetPassword = async(req, res) => {
    const {currentPassword, newPassword} = req.body;
    
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.json({success: false, message: "User not found"});
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({success: false, message: "Current password is incorrect"});
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 8) {
            return res.json({success: false, message: "Password should be at least 8 characters"});
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        await user.save();
        
        res.json({success: true, message: "Password updated successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error updating password"});
    }
}

export {loginUser, registerUser, getUserProfile, updateUserProfile, resetPassword}