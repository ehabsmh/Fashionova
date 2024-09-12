import express from "express"
import { adminAuth } from "../middlewares/auth";
import ProductController from "../controllers/Product";

const productsRouter = express.Router();
productsRouter.post('/product/add', adminAuth, ProductController.add);
productsRouter.put('/product/edit/:productId', adminAuth, ProductController.edit);
export default productsRouter;
