import User from '../../../models/User';
import sendVerificationCode from '../../../utils/verification/sendVerificationCode';
import { db } from './../index';
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from 'bcrypt';


class UserController {
  static async register(req: Request, res: Response) {
    try {
      const newUser = await db.createUser(req.body);

      // Send email to the newly created user with the verification code.
      await sendVerificationCode(newUser);

      await newUser.save();
      res.status(201).json({ message: "User created successfully.", newUser })
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ error: e.message })
    }
  }

  static async verify(req: Request, res: Response) {
    /* this method verifies the user's account by updating the verified property to true. */
    const { email, verificationCode } = req.body;

    try {
      // Get user
      const user = await User.findOne({ email });
      if (!user) throw new Error("404 User not found.");

      if (user.verified) throw new Error("400 User already verified.");

      // Check if verification code is valid.
      if (verificationCode === user.verificationCode) {
        // Check if the verification code has been expired.
        if (user.isVerificationCodeExpired()) throw new Error("400 The verification code has been expired.");

        await user.updateOne({ verified: true });

        // Delete verification keys since will not be used anymore.
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        if (!process.env.SECRET_KEY) throw new Error("500 Secret key is not defined.")
        const token = jwt.sign({ user }, process.env.SECRET_KEY);

        res.json({ message: "Verified successfully.", token });
      } else {
        throw new Error("400 Incorrect code.");
      }

    } catch (error) {
      if (error instanceof Error) {
        const [statusCode, ...message] = error.message.split(' ');
        res.status(+statusCode).json({ message: message.join(' ') });
      }
    }
  }

  static async resendCode(req: Request, res: Response) {
    /* resendCode: resend a new verification code to the user */
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("404 User not found.");
      if (user.verified) throw new Error("400 User already verified");

      // Set a new verification code and expiration date
      user.verificationCode = crypto.randomInt(100000, 999999).toString();
      user.verificationCodeExpire = Date.now() + 30 * 60 * 1000;
      await user.save();

      await sendVerificationCode(user);

      res.json({ message: "Verification code has been resent to your email." })
    } catch (error) {
      if (error instanceof Error) {
        const [statusCode, ...message] = error.message.split(' ');
        res.status(+statusCode).json({ message: message.join(' ') });
      }
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email) throw new Error("400 email field is required.");
      if (!password) throw new Error("400 password field is required.");

      const user = await User.findOne({ email });
      if (!user) throw new Error("401 Incorrect email or password.");

      // Comparing original password with the hashed password.
      const isMatching = await bcrypt.compare(password, user.password);
      if (!isMatching) throw new Error("401 Incorrect email or password.");

      // Check if the user has verified his account.
      if (user && isMatching && !user.verified) {
        // throw new Error("401 Please verify your account.")
        await sendVerificationCode(user);

        const DOMAIN = process.env.APP_DOMAIN;
        const PORT = process.env.APP_PORT;

        return res.status(403).json({
          message: "Please verify your account.",
          verifyUrl: `${DOMAIN}:${PORT}/verify?email=${user.email}`
        })
      };

      if (!process.env.SECRET_KEY) throw new Error("500 Secret key is not defined.");
      const token = jwt.sign({ user }, process.env.SECRET_KEY);

      res.json({ message: `Welcome ${user.fullName}`, token });
    } catch (error) {
      if (error instanceof Error) {
        const [statusCode, ...message] = error.message.split(' ');
        res.status(+statusCode).json({ message: message.join(' ') });
      }
    }
  }
}

export default UserController
