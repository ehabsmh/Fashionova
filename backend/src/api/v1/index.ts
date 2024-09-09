import express from "express";
import 'dotenv/config'
import cors from "cors"
import DB from "../../storage/db";
import userRouter from "./views/users";
import categoryRouter from "./views/categories";
import { auth } from './middlewares/auth';
import subcategoryRouter from "./views/subcategories";


const app = express();
app.use(express.json());
export const db = new DB();
const PORT = Number(process.env.SERVER_PORT) || 3000;
app.use(cors());

app.use("/api/v1/", userRouter);
app.use("/api/v1/", auth, categoryRouter);
app.use("/api/v1/", auth, subcategoryRouter);

app.get('/', (req, res) => {
    res.send("Welcome to Fashionova server.");
});

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT} ...`);
})
