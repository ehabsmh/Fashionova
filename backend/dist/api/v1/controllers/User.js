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
const User_1 = __importDefault(require("../../../models/User"));
const sendVerificationCode_1 = __importDefault(require("../../../utils/verification/sendVerificationCode"));
const index_1 = require("./../index");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const CartItem_1 = __importDefault(require("../../../models/CartItem"));
class UserController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = yield index_1.db.createUser(req.body);
                // Send email to the newly created user with the verification code.
                yield (0, sendVerificationCode_1.default)(newUser);
                yield newUser.save();
                res.status(201).json({ message: "User created successfully.", newUser });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    /**
                     * if e instance of Error it will not match the condition
                     * if e instance of ErrorHandler it will match both constructors.
                     */
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /* this method verifies the user's account by updating the verified property to true. */
            const { email, verificationCode } = req.body;
            try {
                // Get user
                const user = yield User_1.default.findOne({ email });
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                if (user.verified)
                    throw new ErrorHandler_1.default("User already verified.", 400);
                // Check if verification code is valid.
                if (verificationCode === user.verificationCode) {
                    // Check if the verification code has been expired.
                    if (user.isVerificationCodeExpired()) {
                        throw new ErrorHandler_1.default("The verification code has been expired.", 400);
                    }
                    yield user.updateOne({ verified: true });
                    // Delete verification keys since will not be used anymore.
                    user.verificationCode = undefined;
                    user.verificationCodeExpire = undefined;
                    yield user.save();
                    if (!process.env.SECRET_KEY)
                        throw new Error("Secret key is not defined.");
                    const token = jsonwebtoken_1.default.sign({ user: user.toJSON() }, process.env.SECRET_KEY);
                    res.json({ message: "Verified successfully.", token });
                }
                else {
                    throw new ErrorHandler_1.default("Incorrect code.", 400);
                }
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static resendCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /* resendCode: resend a new verification code to the user */
            const { email } = req.body;
            try {
                const user = yield User_1.default.findOne({ email });
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                if (user.verified)
                    throw new ErrorHandler_1.default("User already verified", 400);
                // Set a new verification code and expiration date
                user.verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
                user.verificationCodeExpire = Date.now() + 30 * 60 * 1000;
                yield user.save();
                yield (0, sendVerificationCode_1.default)(user);
                res.json({ message: "Verification code has been resent to your email." });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                if (!email)
                    throw new ErrorHandler_1.default("email field is required.", 400);
                if (!password)
                    throw new ErrorHandler_1.default("password field is required.", 400);
                const user = yield User_1.default.findOne({ email });
                if (!user)
                    throw new ErrorHandler_1.default("Incorrect email or password.", 401);
                // Comparing original password with the hashed password.
                const isMatching = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatching)
                    throw new ErrorHandler_1.default("Incorrect email or password.", 401);
                // Check if the user has verified his account.
                if (user && isMatching && !user.verified) {
                    // throw new Error("401 Please verify your account.")
                    yield (0, sendVerificationCode_1.default)(user);
                    const DOMAIN = process.env.APP_DOMAIN;
                    const PORT = process.env.APP_PORT;
                    return res.status(403).json({
                        message: "Please verify your account.",
                        verifyUrl: `${DOMAIN}:${PORT}/verify?email=${user.email}`
                    });
                }
                ;
                if (!process.env.SECRET_KEY)
                    throw new Error("Secret key is not defined.");
                const token = jsonwebtoken_1.default.sign({ user: user.toJSON() }, process.env.SECRET_KEY);
                res.json({ message: `Welcome ${user.fullName}`, token });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, variant, quantity } = req.body;
                const userId = req.user._id;
                if (!quantity)
                    throw new ErrorHandler_1.default("Add item's quantity.", 400);
                if (!('color' in variant) && !('size' in variant)) {
                    throw new ErrorHandler_1.default("Variant must have color and size.", 400);
                }
                const user = yield User_1.default.findById(userId).populate("cart.items");
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                for (const itemId of user.cart.items) {
                    const item = yield CartItem_1.default.findById(itemId);
                    if ((item === null || item === void 0 ? void 0 : item.productId.toString()) === productId && (item === null || item === void 0 ? void 0 : item.variant.color) === variant.color && (item === null || item === void 0 ? void 0 : item.variant.size) === variant.size) {
                        throw new ErrorHandler_1.default("Item already in the cart.", 409);
                    }
                }
                const cartItem = yield CartItem_1.default.create({ productId, variant, quantity });
                yield user.updateOne({ $push: { 'cart.items': cartItem }, $inc: { 'cart.totalPrice': cartItem.price } });
                res.json({ message: "Item added to cart.", cartItem });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static deleteFromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cartItemId } = req.params;
            const userId = req.user._id;
            try {
                const user = yield User_1.default.findById(userId);
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                const cartItem = yield CartItem_1.default.findById(cartItemId);
                if (!cartItem)
                    throw new ErrorHandler_1.default("Item not found in the cart.", 404);
                yield (user === null || user === void 0 ? void 0 : user.updateOne({ $pull: { 'cart.items': cartItemId }, $inc: { 'cart.totalPrice': -cartItem.price } }));
                yield cartItem.deleteOne({ _id: cartItemId });
                res.json({ message: "Item deleted from cart." });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    return res.status(500).json({ error: e.message });
            }
        });
    }
    static getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            try {
                const user = yield User_1.default.findById(userId).populate("cart.items").populate("cart.items.productId");
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                res.json(user.cart);
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    return res.status(500).json({ error: e.message });
            }
        });
    }
}
exports.default = UserController;
