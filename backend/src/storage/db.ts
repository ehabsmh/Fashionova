import mongoose from "mongoose";
import UserInterface from '../interfaces/User';
import User from "../models/User";
import bcrypt from "bcrypt";
import crypto from "crypto";

class DB {
  constructor() {
    /* connect to the database */
    const HOST = process.env.DB_HOST || "127.0.0.1";
    const PORT = process.env.DB_PORT || "27017";
    const DB_NAME = process.env.DB_NAME || "fashionova";
    mongoose.connect(`mongodb://${HOST}:${PORT}/${DB_NAME}`).then(() => {
      console.log("Database connected.");
    }).catch(() => { console.log("Failed to connect to the database."); })
  }

  async createUser(reqBody: UserInterface) {
    if (!reqBody) throw new Error("Request body is empty.");

    // Check user existence
    const isExist = await User.findOne({ email: reqBody.email });
    if (isExist) throw new Error("Email already exists.");

    // Change the date string format to date type.
    if (typeof reqBody.birthDate === 'string') {
      const [yyyy, mm, dd] = reqBody.birthDate.split('-');
      reqBody.birthDate = new Date(Number(yyyy), Number(mm), Number(dd));
    }

    // Hash password
    const saltRounds = 10;
    const hashedPw = await bcrypt.hash(reqBody.password, saltRounds);
    reqBody.password = hashedPw;

    return new User(reqBody);
  }
}

export default DB;
