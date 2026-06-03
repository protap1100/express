import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.headers)
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access!!",
      });
    }

    next();
  };
};

export default auth;
