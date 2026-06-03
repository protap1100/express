import { Router, type NextFunction } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { userRole } from "../../types";

const router = Router();

router.post("/", userController.createUser);
router.get("/", auth(userRole.admin,userRole.user), userController.getAllUser);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
