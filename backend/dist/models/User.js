"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['shopper', 'admin'], default: "shopper" },
    birthDate: { type: Date },
    country: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: Number, required: true },
    address: { type: String, required: true },
    countryCode: { type: String, required: true },
    phoneNo1: { type: String, required: true },
    phoneNo2: { type: String },
    image: { type: String, default: "no image" },
    verificationCode: { type: String, default: crypto_1.default.randomInt(100000, 999999).toString() },
    cart: [{ type: mongoose_1.Types.ObjectId, ref: "cartItem" }]
}, { timestamps: true });
UserSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
UserSchema.virtual('').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
const User = (0, mongoose_1.model)('User', UserSchema);
exports.default = User;
