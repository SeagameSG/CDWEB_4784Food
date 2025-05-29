import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    street: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true, default: "721400"},
    country: {type: String, default: "VietNam"},
    coordinates: {type: Object, required: true},
    isDefault: {type: Boolean, default: false}
}, {timestamps: true});

const addressModel = mongoose.models.address || mongoose.model("address", addressSchema);

export default addressModel;