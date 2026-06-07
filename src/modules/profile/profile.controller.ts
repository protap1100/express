import type { Request, Response } from "express";
import { profileService } from "./profile.service";
import sendResponse from "../../utilities/sendReponse";

const createProfile = async (req: Request, res: Response) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Profile Created Successfully!",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error,
    });
  }
};

export const profileController = {
  createProfile,
};
