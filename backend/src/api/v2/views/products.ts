import express from "express"
import { adminAuth } from "../middlewares/auth";
import ProductController from "../controllers/Product";
import upload from "../../../Services/uploadFile";

const productsRouter = express.Router();
productsRouter.post('/product/add', adminAuth, upload.any(), ProductController.add);
productsRouter.put('/product/edit/:productId', adminAuth, ProductController.edit);
productsRouter.delete('/product/delete/:productId', adminAuth, ProductController.delete);
productsRouter.delete('/product/:productId/deleteImage/:imgId', adminAuth, ProductController.deleteImage);
productsRouter.post('/product/:productId/addImage', adminAuth, upload.single('image'), ProductController.addImage);
productsRouter.get('/products/', ProductController.all);
productsRouter.get('/products/', ProductController.by);
productsRouter.get('/product/:slug', ProductController.bySlug);
export default productsRouter;
