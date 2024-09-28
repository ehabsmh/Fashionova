import express from "express"
import CategoryController from '../controllers/Category';
import upload from '../../../Services/uploadFile';
import { adminAuth } from "../middlewares/auth";

const categoryRouter = express.Router();
categoryRouter.post('/category/add', adminAuth, upload.single('image'), CategoryController.add);
categoryRouter.put('/category/edit/:id', adminAuth, upload.single('image'), CategoryController.edit);
categoryRouter.delete('/category/delete/:id', adminAuth, CategoryController.delete);
categoryRouter.get('/category/', CategoryController.getAllBySex);
export default categoryRouter;
