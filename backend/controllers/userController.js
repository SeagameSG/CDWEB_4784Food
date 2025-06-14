import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import nodemailer from 'nodemailer';

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

// Gửi mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '4784Food - Password Reset OTP',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2E8B57; text-align: center;">4784Food Password Reset</h2>
        <p>Your One-Time Password (OTP) for password reset is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          © 2025 4784Food. All rights reserved.
        </p>
      </div>
    `
    };

    return transporter.sendMail(mailOptions);
};

// Request OTP for authenticated user to change password
const requestChangePasswordOTP = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user details
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Save OTP to user record
        user.changePasswordOTP = otp;
        user.changePasswordExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        await sendOTPEmail(user.email, otp);

        res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.error("Error in requestChangePasswordOTP:", error);
        res.json({ success: false, message: "Failed to send OTP" });
    }
};

// Change password with OTP for an authenticated user
const changePasswordWithOTP = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otp, newPassword } = req.body;

        if (!otp || !newPassword) {
            return res.json({ success: false, message: "OTP and new password are required" });
        }

        // Find user and verify OTP
        const user = await userModel.findOne({
            _id: userId,
            changePasswordOTP: otp,
            changePasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        // Update password and clear OTP
        user.password = await bcrypt.hash(newPassword, salt);
        user.changePasswordOTP = undefined;
        user.changePasswordExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePasswordWithOTP:", error);
        res.json({ success: false, message: "Failed to change password" });
    }
};

export {loginUser, registerUser, getUserProfile, updateUserProfile, requestChangePasswordOTP, changePasswordWithOTP};