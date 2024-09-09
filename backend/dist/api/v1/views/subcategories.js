"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const Subcategory_1 = __importDefault(require("../controllers/Subcategory"));
const subcategoryRouter = express_1.default.Router();
subcategoryRouter.post('/subcategory/add', auth_1.adminAuth, Subcategory_1.default.add);
subcategoryRouter.put('/subcategory/edit/:subcategoryId', auth_1.adminAuth, Subcategory_1.default.edit);
subcategoryRouter.delete('/subcategory/delete/:subcategoryId', auth_1.adminAuth, Subcategory_1.default.delete);
exports.default = subcategoryRouter;
