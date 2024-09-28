import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../../../interfaces/User";

interface DecodedUser extends Request { user: User }

export const auth = (req: Request, res: Response, next: NextFunction): void | never => {
  const token = req.headers.token as string;

  try {
    if (!token) throw new Error("token is required.");

    if (!process.env.SECRET_KEY) throw new Error("env SECRET_KEY is not exists.");

    const decoded = <DecodedUser>jwt.verify(token, process.env.SECRET_KEY);
    (req as any).user = decoded.user;
    next();
  } catch (error) {
    if (error instanceof Error)
      res.status(403).json({ message: error.message });
  }
}

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const { role }: User = (req as any).user;
  if (role !== 'admin') return res.status(403).json({ message: "Unauthorized access." });
  next();
}
