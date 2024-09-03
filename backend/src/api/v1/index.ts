import express from "express";
import cors from "cors"
import DB from "../../storage/db";
import userRouter from "./views/users";

const app = express();
const PORT = 3000;
export const db = new DB();
app.use(cors());
app.use(express.json());
app.use("/api/v1/", userRouter);
app.get('/', (req, res) => {
    res.send("Welcome to Fashionova server.");
});

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT} ...`);
})
