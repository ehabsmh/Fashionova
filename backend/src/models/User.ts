import { Schema, Types, model } from "mongoose";
import crypto from "crypto";

const UserSchema = new Schema({
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
    phone1: { type: Number, required: true },
    phone2: { type: Number },
    image: { type: String, default: "no image" },
    verificationCode: { type: String, default: crypto.randomInt(100000, 999999).toString() },
    cart: [{ type: Types.ObjectId, ref: "cartItem" }]
}, { timestamps: true })

UserSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
})

const User = model('User', UserSchema);
export default User;
