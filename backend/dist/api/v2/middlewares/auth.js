"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    const token = req.headers.token;
    try {
        if (!token)
            throw new Error("token is required.");
        if (!process.env.SECRET_KEY)
            throw new Error("env SECRET_KEY is not exists.");
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        req.user = decoded.user;
        next();
    }
    catch (error) {
        if (error instanceof Error)
            res.status(403).json({ message: error.message });
    }
};
exports.auth = auth;
const adminAuth = (req, res, next) => {
    const { role } = req.user;
    if (role !== 'admin')
        return res.status(403).json({ message: "Unauthorized access." });
    next();
};
exports.adminAuth = adminAuth;
