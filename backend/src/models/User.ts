import { Document, Schema, Types, model } from "mongoose";
import crypto from "crypto";

interface UserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    verified: boolean;
    password: string;
    role: string;
    birthDate: Date;
    country: string;
    city: string;
    zipCode: number;
    address: string;
    countryCode: string;
    phoneNo1: string;
    phoneNo2?: string;
    image: string;
    verificationCode?: string;
    verificationCodeExpire?: number;
    cart: Types.ObjectId[];
    isVerificationCodeExpired: () => boolean;
    fullName?: string;
}
const UserSchema = new Schema<UserDocument>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['shopper', 'admin'], default: "shopper" },
    birthDate: { type: Date },
    country: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: Number, required: true },
    address: { type: String, required: true },
    countryCode: { type: String, required: true, default: "+20" },
    phoneNo1: { type: String, required: true },
    phoneNo2: { type: String },
    image: { type: String, default: "no image" },
    verificationCode: { type: String, default: crypto.randomInt(100000, 999999).toString() },
    verificationCodeExpire: { type: Number, default: Date.now() + 30 * 60 * 1000 },
    cart: [{ type: Types.ObjectId, ref: "CartItem" }]
}, {
    timestamps: true
})

UserSchema.methods.isVerificationCodeExpired = function () {
    return Date.now() > this.verificationCodeExpire;
};

UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = model<UserDocument>('User', UserSchema);
export default User;
