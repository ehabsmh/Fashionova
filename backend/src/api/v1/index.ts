import express from "express";
import cors from "cors"
import DB from "../../storage/db";

const app = express();
const PORT = 3000;
const db = new DB();
app.use(cors());
app.get('/', (req, res) => {
    res.send("Welcome to Fashionova server.");
});

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT} ...`);
})
