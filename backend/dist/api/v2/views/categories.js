"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Category_1 = __importDefault(require("../controllers/Category"));
const uploadFile_1 = __importDefault(require("../../../Services/uploadFile"));
const auth_1 = require("../middlewares/auth");
const categoryRouter = express_1.default.Router();
categoryRouter.post('/category/add', auth_1.adminAuth, uploadFile_1.default.single('image'), Category_1.default.add);
categoryRouter.put('/category/edit/:id', auth_1.adminAuth, uploadFile_1.default.single('image'), Category_1.default.edit);
categoryRouter.delete('/category/delete/:id', auth_1.adminAuth, Category_1.default.delete);
categoryRouter.get('/category/', Category_1.default.getAllBySex);
exports.default = categoryRouter;
