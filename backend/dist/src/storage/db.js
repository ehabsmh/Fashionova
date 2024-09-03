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
const crypto_1 = __importDefault(require("crypto"));
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
                throw new Error("Request body is empty.");
            // Check user existence
            const isExist = yield User_1.default.findOne({ email: reqBody.email });
            if (isExist)
                throw new Error("Email already exists.");
            // Change the date string format to date type.
            if (typeof reqBody.birthDate === 'string') {
                const [yyyy, mm, dd] = reqBody.birthDate.split('-');
                reqBody.birthDate = new Date(Number(yyyy), Number(mm), Number(dd));
            }
            // Hash password
            const saltRounds = 10;
            const hashedPw = yield bcrypt_1.default.hash(reqBody.password, saltRounds);
            reqBody.password = hashedPw;
            // Generate verification code
            const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
            reqBody.verificationCode = verificationCode;
            return new User_1.default(reqBody);
        });
    }
}
exports.default = DB;
