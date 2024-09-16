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
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../utils/user");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const uploadFile_1 = require("../Services/uploadFile");
class DB {
    constructor() {
        /* connect to the database */
        const HOST = process.env.DB_HOST || "127.0.0.1";
        const PORT = process.env.DB_PORT || "27017";
        const DB_NAME = process.env.DB_NAME || "fashionova";
        mongoose_1.default.connect(`mongodb://${HOST}:${PORT}/${DB_NAME}`).then(() => {
            console.log("Database connected.");
        }).catch(() => { console.log("Failed to connect to the database."); });
    }
    createUser(reqBody) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!reqBody)
                throw new ErrorHandler_1.default("Request body is empty.", 401);
            // Check user existence
            const isExist = yield User_1.default.findOne({ email: reqBody.email });
            if (isExist)
                throw new ErrorHandler_1.default("Email already exists.", 409);
            // Change the date string format to date type.
            if (typeof reqBody.birthDate === 'string') {
                const [yyyy, mm, dd] = reqBody.birthDate.split('-');
                reqBody.birthDate = new Date(Number(yyyy), Number(mm), Number(dd));
            }
            // Password hashing
            const saltRounds = 10;
            const hashedPw = yield bcrypt_1.default.hash(reqBody.password, saltRounds);
            reqBody.password = hashedPw;
            // add country code to the phone number
            const { countryCode, phoneNo1, phoneNo2 } = reqBody;
            reqBody.phoneNo1 = (0, user_1.addCountryCode)(countryCode, phoneNo1);
            reqBody.phoneNo2 = phoneNo2 ? (0, user_1.addCountryCode)(countryCode, phoneNo2) : undefined;
            return new User_1.default(reqBody);
        });
    }
    checkVariantsColorUniqueness(variants) {
        console.log("xx");
        if (!variants.length)
            throw new ErrorHandler_1.default("Variants cannot be empty.", 400);
        variants.forEach((variant, i) => {
            const colors = variants.slice(i + 1).filter((v) => variant.color.toLowerCase() === v.color.toLowerCase());
            if (colors.length >= 1)
                throw new ErrorHandler_1.default(`Color ${variant.color} is duplicated.`, 409);
        });
        return true;
    }
    addImagesToProduct(files, product) {
        return __awaiter(this, void 0, void 0, function* () {
            // If req.files is an array (which it is when using upload.any())
            if (files && Array.isArray(files)) {
                for (const file of files) {
                    // Destructure the field name, index, and property name
                    const [field, indexString, propertyName] = file.fieldname.split("-");
                    const index = Number(indexString);
                    // Ensure that the fieldname is correct before proceeding
                    if (field === "variants" && propertyName === "images") {
                        // Upload image to cloud storage
                        const url = yield (0, uploadFile_1.uploadFileToCloud)(file.path, 'products', 350, 350);
                        // Push the image URL to the corresponding variant's images array
                        product.variants[index].images.push(url);
                    }
                }
            }
        });
    }
}
exports.default = DB;
