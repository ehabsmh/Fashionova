import User from '../../../models/User';
import sendVerificationCode from '../../../utils/verification/sendVerificationCode';
import { db } from './../index';
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import ErrorHandler from '../../../utils/ErrorHandler';
import CartItem from '../../../models/CartItem';


class UserController {
  static async register(req: Request, res: Response) {
    try {
      const newUser = await db.createUser(req.body);

      // Send email to the newly created user with the verification code.
      await sendVerificationCode(newUser);

      await newUser.save();
      res.status(201).json({ message: "User created successfully.", newUser })
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        /**
         * if e instance of Error it will not match the condition
         * if e instance of ErrorHandler it will match both constructors.
         */

        return res.status(e.statusCode).json({ error: e.message });

      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async verify(req: Request, res: Response) {
    /* this method verifies the user's account by updating the verified property to true. */
    const { email, verificationCode } = req.body;

    try {
      // Get user
      const user = await User.findOne({ email });
      if (!user) throw new ErrorHandler("User not found.", 404);

      if (user.verified) throw new ErrorHandler("User already verified.", 400);

      // Check if verification code is valid.
      if (verificationCode === user.verificationCode) {
        // Check if the verification code has been expired.
        if (user.isVerificationCodeExpired()) {
          throw new ErrorHandler("The verification code has been expired.", 400);
        }

        await user.updateOne({ verified: true });

        // Delete verification keys since will not be used anymore.
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        if (!process.env.SECRET_KEY) throw new Error("Secret key is not defined.");

        const token = jwt.sign({ user: user.toJSON() }, process.env.SECRET_KEY);

        res.json({ message: "Verified successfully.", token });
      } else {
        throw new ErrorHandler("Incorrect code.", 400);
      }

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async resendCode(req: Request, res: Response) {
    /* resendCode: resend a new verification code to the user */
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) throw new ErrorHandler("User not found.", 404);
      if (user.verified) throw new ErrorHandler("User already verified", 400);

      // Set a new verification code and expiration date
      user.verificationCode = crypto.randomInt(100000, 999999).toString();
      user.verificationCodeExpire = Date.now() + 30 * 60 * 1000;
      await user.save();

      await sendVerificationCode(user);

      res.json({ message: "Verification code has been resent to your email." })
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email) throw new ErrorHandler("email field is required.", 400);
      if (!password) throw new ErrorHandler("password field is required.", 400);

      const user = await User.findOne({ email });
      if (!user) throw new ErrorHandler("Incorrect email or password.", 401);

      // Comparing original password with the hashed password.
      const isMatching = await bcrypt.compare(password, user.password);
      if (!isMatching) throw new ErrorHandler("Incorrect email or password.", 401);

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

      if (!process.env.SECRET_KEY) throw new Error("Secret key is not defined.");
      const token = jwt.sign({ user: user.toJSON() }, process.env.SECRET_KEY);

      res.json({ message: `Welcome ${user.fullName}`, token });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async addToCart(req: Request, res: Response) {
    try {
      const { productId, variant, quantity } = req.body;
      const userId = (req as any).user._id;

      if (!quantity) throw new ErrorHandler("Add item's quantity.", 400);

      if (!('color' in variant) && !('size' in variant)) {
        throw new ErrorHandler("Variant must have color and size.", 400);
      }

      const user = await User.findById(userId).populate("cart.items");
      if (!user) throw new ErrorHandler("User not found.", 404);

      for (const itemId of user.cart.items) {
        const item = await CartItem.findById(itemId);
        if (item?.productId.toString() === productId && item?.variant.color === variant.color && item?.variant.size === variant.size) {
          throw new ErrorHandler("Item already in the cart.", 409);
        }
      }

      const cartItem = await CartItem.create({ productId, variant, quantity });
      await user.updateOne({ $push: { 'cart.items': cartItem }, $inc: { 'cart.totalPrice': cartItem.price } });


      res.json({ message: "Item added to cart.", cartItem });

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async deleteFromCart(req: Request, res: Response) {
    const { cartItemId } = req.params;
    const userId = (req as any).user._id;

    try {
      const user = await User.findById(userId);
      if (!user) throw new ErrorHandler("User not found.", 404);

      const cartItem = await CartItem.findById(cartItemId);
      if (!cartItem) throw new ErrorHandler("Item not found in the cart.", 404);

      await user?.updateOne({ $pull: { 'cart.items': cartItemId }, $inc: { 'cart.totalPrice': -cartItem.price } })
      await cartItem.deleteOne({ _id: cartItemId });

      res.json({ message: "Item deleted from cart." });

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error) return res.status(500).json({ error: e.message })
    }

  }
  static async getCart(req: Request, res: Response) {
    const userId = (req as any).user._id;

    try {
      const user = await User.findById(userId).populate("cart.items").populate("cart.items.productId");
      if (!user) throw new ErrorHandler("User not found.", 404);

      res.json(user.cart);

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error) return res.status(500).json({ error: e.message })
    }
  }
}

export default UserController
