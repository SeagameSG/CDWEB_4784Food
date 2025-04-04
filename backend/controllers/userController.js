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
            return res.json({success:false, message:"User does't exist"})
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
    const {name,password,email} = req.body;
    try {
        // kiểm tra tồn tại
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }
        // validate email
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"plase enter valid email"})
        }
        // password length
        if (password.length<8) {
            return res.json({success:false, message:"plase enter a storng password"})
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);
        // tạo user
        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
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
export {loginUser, registerUser}