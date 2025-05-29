import foodModel from "../models/foodModel.js";
import fs from 'fs';

// add food item
const addFood = async (req,res) => {
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try {
        await food.save();
        res.json({success:true, message:"Food Added Successfully"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Food not added successfully"})
    }
}

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success:true, data:foods})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Food List Not Found"})
    }
}

// get food by id
const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.json({success:false, message:"Food not found"});
        }
        res.json({success:true, data:food});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error fetching food details"});
    }
}

// update food item
const updateFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.json({success:false, message:"Food not found"});
        }

        food.name = req.body.name;
        food.description = req.body.description;
        food.price = req.body.price;
        food.category = req.body.category;

        if (req.file) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.log("Error deleting old image:", err);
            });
            food.image = req.file.filename;
        }

        await food.save();
        res.json({success:true, message:"Food Updated Successfully"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Food not updated successfully"});
    }
}

// remove food item
const removeFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({success:false, message:"Food not found"});
        }
        fs.unlink(`uploads/${food.image}`, (err) => {
            if (err) console.log("Error deleting image:", err);
        });
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Food removed successfully"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Food not removed successfully"});
    }
}

export {addFood, listFood, removeFood, updateFood, getFoodById};