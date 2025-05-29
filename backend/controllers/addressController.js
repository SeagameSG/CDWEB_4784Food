import addressModel from "../models/addressModel.js";

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try {
        const addresses = await addressModel.find({userId: req.body.userId}).sort({createdAt: -1});
        res.json({success: true, data: addresses});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error fetching addresses"});
    }
};

// Add a new address
const addAddress = async (req, res) => {
    try {
        const {userId, name, phone, street, city, state, zipcode, country, coordinates, isDefault} = req.body;
        
        // If this is set as default, remove default from all others
        if (isDefault) {
            await addressModel.updateMany({userId}, {isDefault: false});
        }
        
        const newAddress = new addressModel({
            userId,
            name,
            phone,
            street,
            city,
            state,
            zipcode,
            country,
            coordinates,
            isDefault
        });
        
        await newAddress.save();
        res.json({success: true, message: "Address added successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error adding address"});
    }
};

// Update an address
const updateAddress = async (req, res) => {
    try {
        const {addressId, name, phone, street, city, state, zipcode, country, coordinates, isDefault} = req.body;
        
        // If this is set as default, remove default from all others
        if (isDefault) {
            await addressModel.updateMany({userId: req.body.userId}, {isDefault: false});
        }
        
        await addressModel.findByIdAndUpdate(addressId, {
            name,
            phone,
            street,
            city,
            state,
            zipcode,
            country,
            coordinates,
            isDefault
        });
        
        res.json({success: true, message: "Address updated successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error updating address"});
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const {addressId} = req.body;
        
        // Check if it's the default address
        const address = await addressModel.findById(addressId);
        await addressModel.findByIdAndDelete(addressId);
        
        // If it was default, set a new default if other addresses exist
        if (address.isDefault) {
            const remainingAddress = await addressModel.findOne({userId: req.body.userId});
            if (remainingAddress) {
                await addressModel.findByIdAndUpdate(remainingAddress._id, {isDefault: true});
            }
        }
        
        res.json({success: true, message: "Address deleted successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error deleting address"});
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const {addressId} = req.body;
        
        // Remove default from all addresses
        await addressModel.updateMany({userId: req.body.userId}, {isDefault: false});
        
        // Set this one as default
        await addressModel.findByIdAndUpdate(addressId, {isDefault: true});
        
        res.json({success: true, message: "Default address updated"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error updating default address"});
    }
};

export {getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress};