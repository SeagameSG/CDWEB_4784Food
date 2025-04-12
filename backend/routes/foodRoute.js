import express from "express"
import { addFood,listFood,removeFood } from "../controllers/foodController.js"
// by using multer we can save image
import multer from "multer"


const foodRouter = express.Router();

// image storage engine
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb) => {
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})
// using this we can store image in this folser
const upload = multer({storage:storage})

foodRouter.post("/add", upload.single("image"),addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);






export default foodRouter;
