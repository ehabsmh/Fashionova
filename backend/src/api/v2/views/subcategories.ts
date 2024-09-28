import express from "express"
import { adminAuth } from "../middlewares/auth";
import SubcategoryController from "../controllers/Subcategory";

const subcategoryRouter = express.Router();
subcategoryRouter.post('/subcategory/add', adminAuth, SubcategoryController.add);
subcategoryRouter.put('/subcategory/edit/:subcategoryId', adminAuth, SubcategoryController.edit);
subcategoryRouter.delete('/subcategory/delete/:subcategoryId', adminAuth, SubcategoryController.delete);
subcategoryRouter.get('/subcategory/getByCategory/', SubcategoryController.getByCategory);
export default subcategoryRouter;
