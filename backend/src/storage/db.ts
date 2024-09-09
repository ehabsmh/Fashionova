import mongoose from "mongoose";
import UserInterface from '../interfaces/User';
import User from "../models/User";
import bcrypt from "bcrypt";
import { addCountryCode } from "../utils/user";
import ErrorHandler from "../utils/ErrorHandler";

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
    if (!reqBody) throw new ErrorHandler("Request body is empty.", 401);

    // Check user existence
    const isExist = await User.findOne({ email: reqBody.email });
    if (isExist) throw new ErrorHandler("Email already exists.", 409);

    // Change the date string format to date type.
    if (typeof reqBody.birthDate === 'string') {
      const [yyyy, mm, dd] = reqBody.birthDate.split('-');
      reqBody.birthDate = new Date(Number(yyyy), Number(mm), Number(dd));
    }

    // Password hashing
    const saltRounds = 10;
    const hashedPw = await bcrypt.hash(reqBody.password, saltRounds);
    reqBody.password = hashedPw;

    // add country code to the phone number
    const { countryCode, phoneNo1, phoneNo2 } = reqBody;
    reqBody.phoneNo1 = addCountryCode(countryCode, phoneNo1);
    reqBody.phoneNo2 = phoneNo2 ? addCountryCode(countryCode, phoneNo2) : undefined;

    return new User(reqBody);
  }
}

export default DB;
