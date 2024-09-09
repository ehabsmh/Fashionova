"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToCloud = void 0;
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const cloudinaryConfig_1 = __importDefault(require("./cloudinaryConfig"));
let publicId = '';
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './backend/tmp/uploads/');
    },
    filename: function (req, file, cb) {
        publicId = (0, uuid_1.v4)();
        cb(null, publicId);
    }
});
function fileFilter(req, file, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        // if (await Category.findOne({ name: req.body.name })) {
        //     cb<Error>(new Error('Category already exists.'), false);
        // }
        if (file.mimetype.startsWith('image'))
            cb(null, true);
        else
            cb(new Error('Only images supported.'), false);
    });
}
const uploadFileToCloud = (imagePath, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cloudinaryConfig_1.default.uploader.upload(imagePath, { folder, public_id: publicId });
    const url = cloudinaryConfig_1.default.url(result.public_id, {
        transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 200, height: 200, crop: 'fill', gravity: 'auto' }
        ]
    });
    return url;
});
exports.uploadFileToCloud = uploadFileToCloud;
const upload = (0, multer_1.default)({ storage, fileFilter });
exports.default = upload;
