import express from "express"
import { adminAuth } from "../middlewares/auth";
import SubcategoryController from "../controllers/Subcategory";

const subcategoryRouter = express.Router();
subcategoryRouter.post('/subcategory/add', adminAuth, SubcategoryController.add);
export default subcategoryRouter;
