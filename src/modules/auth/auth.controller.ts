import type { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserInfoDB(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false, // inProduction true;
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      success: true,
      message: "User Logged in Successfully!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    res.status(201).json({
      success: true,
      message: "User Logged in Successfully!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  loginUser,
  refreshToken,
};
