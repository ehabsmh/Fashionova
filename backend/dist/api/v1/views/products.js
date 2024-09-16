"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const Product_1 = __importDefault(require("../controllers/Product"));
const uploadFile_1 = __importDefault(require("../../../Services/uploadFile"));
const productsRouter = express_1.default.Router();
productsRouter.post('/product/add', auth_1.adminAuth, uploadFile_1.default.any(), Product_1.default.add);
productsRouter.put('/product/edit/:productId', auth_1.adminAuth, Product_1.default.edit);
productsRouter.delete('/product/delete/:productId', auth_1.adminAuth, Product_1.default.delete);
productsRouter.delete('/product/:productId/deleteImage/:imgId', auth_1.adminAuth, Product_1.default.deleteImage);
productsRouter.post('/product/:productId/addImage', auth_1.adminAuth, uploadFile_1.default.single('image'), Product_1.default.addImage);
exports.default = productsRouter;
