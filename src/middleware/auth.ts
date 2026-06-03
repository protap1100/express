import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req.headers)
      const token = req.headers.authorization;
      console.log(token);
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!!",
        });
      }
      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      console.log("Decoded", decoded);

      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email =$1`,
        [decoded.email],
      );
      // console.log(userData);
      const user = userData.rows[0];
      // console.log(user);
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
