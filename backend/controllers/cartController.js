import userModel from '../models/userModel.js';


// add items to cart
const addToCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        }
        else
        {
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true, message:"Food added to cart"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Food can't able to add"})
    }
}

// remove from cart
const removeFromCart = async(req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true, message:"Removed from cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Cant able to remove from cart"})
    }
}

// fetch cart
const getCart = async(req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        res.json({success:true, cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"ERROR"})
    }
}




export {addToCart,removeFromCart,getCart}