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
                if (e instanceof Error)
                    res.status(400).json({ error: e.message });
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
                    throw new Error("404 User not found.");
                if (user.verified)
                    throw new Error("400 User already verified.");
                // Check if verification code is valid.
                if (verificationCode === user.verificationCode) {
                    // Check if the verification code has been expired.
                    if (user.isVerificationCodeExpired())
                        throw new Error("400 The verification code has been expired.");
                    yield user.updateOne({ verified: true });
                    // Delete verification keys since will not be used anymore.
                    user.verificationCode = undefined;
                    user.verificationCodeExpire = undefined;
                    yield user.save();
                    if (!process.env.SECRET_KEY)
                        throw new Error("500 Secret key is not defined.");
                    const token = jsonwebtoken_1.default.sign({ user }, process.env.SECRET_KEY);
                    res.json({ message: "Verified successfully.", token });
                }
                else {
                    throw new Error("400 Incorrect code.");
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    const [statusCode, ...message] = error.message.split(' ');
                    res.status(+statusCode).json({ message: message.join(' ') });
                }
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
                    throw new Error("404 User not found.");
                if (user.verified)
                    throw new Error("400 User already verified");
                // Set a new verification code and expiration date
                user.verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
                user.verificationCodeExpire = Date.now() + 30 * 60 * 1000;
                yield user.save();
                yield (0, sendVerificationCode_1.default)(user);
                res.json({ message: "Verification code has been resent to your email." });
            }
            catch (error) {
                if (error instanceof Error) {
                    const [statusCode, ...message] = error.message.split(' ');
                    res.status(+statusCode).json({ message: message.join(' ') });
                }
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                if (!email)
                    throw new Error("400 email field is required.");
                if (!password)
                    throw new Error("400 password field is required.");
                const user = yield User_1.default.findOne({ email });
                if (!user)
                    throw new Error("401 Incorrect email or password.");
                // Comparing original password with the hashed password.
                const isMatching = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatching)
                    throw new Error("401 Incorrect email or password.");
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
                    throw new Error("500 Secret key is not defined.");
                const token = jsonwebtoken_1.default.sign({ user }, process.env.SECRET_KEY);
                res.json({ message: `Welcome ${user.fullName}`, token });
            }
            catch (error) {
                if (error instanceof Error) {
                    const [statusCode, ...message] = error.message.split(' ');
                    res.status(+statusCode).json({ message: message.join(' ') });
                }
            }
        });
    }
}
exports.default = UserController;
