"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("../../storage/db"));
const users_1 = __importDefault(require("./views/users"));
const app = (0, express_1.default)();
exports.db = new db_1.default();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/", users_1.default);
app.get('/', (req, res) => {
    res.send("Welcome to Fashionova server.");
});
app.listen(PORT, () => {
    console.log(`app is running on port ${PORT} ...`);
});
