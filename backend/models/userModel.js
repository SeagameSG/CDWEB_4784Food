import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required:true},
    coordinates:{type: Object, default:{lat: 10.8685, lng: 106.7800}},
    cartData:{type: Object, default:{}},
    gender:{type: String, enum: ['male', 'female', 'other'], default: 'other'},
    phone:{type: String, default: '1'},
    resetPasswordOTP: {type: String},
    resetPasswordExpiry: {type: Date},
    changePasswordOTP: {type: String},
    changePasswordExpiry: {type: Date}
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;