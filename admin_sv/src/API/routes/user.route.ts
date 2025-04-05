import { Router } from "express";
import asyncHandler from "../helpers/asyncHandler";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { AdminController } from "../controllers";

const userRoutes = Router();

userRoutes.post("/login", asyncHandler(AdminController.login));

// userRoutes.post("/refresh-token", asyncHandler(AdminController.refreshToken));
userRoutes.use(AuthMiddleware.checkAuth);
// profile
userRoutes.get("/profile", asyncHandler(AdminController.getProfile));
userRoutes.put("/profile", asyncHandler(AdminController.updateProfile));
// bank

export default userRoutes;
