import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  //   console.log(req.body);
  //   const { name, email, password, age } = req.body;
  try {
    const result = await userService.createUserInfoDB(req.body);
    // console.log(result);
    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    console.log("controller", req.user);
    const result = await userService.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(id as string);
    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { name, password, age, is_active } = req.body;
    // console.log( id,name, password, age, is_active);
    const result = await userService.updateUserFromDB(id as string, req.body);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        // data: {},
      });
    }
    // console.log(result);
    res.status(200).json({
      success: true,
      message: "User Updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id as string);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }
    return res.status(200).json({
      success: true,
      message: "User Deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const userController = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
