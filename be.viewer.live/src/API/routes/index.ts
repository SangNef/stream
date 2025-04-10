import express from "express";
import userRouter from "./user.router";
import AuthMiddleWare from "../middlewares/user.middleware";
import AuthService from "../services/auth.service";
import AuthController from "../controllers/auth.controller";
import asyncHandler from "../helpers/asyncHandler";
import { upload } from "../helpers/multer";

const router = express.Router();

router.use('/user', userRouter);
router.post('/auth/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired as any), asyncHandler(AuthService.providerRefreshToken as any));

router.use(asyncHandler(AuthMiddleWare.checkAuth as any));
router.get('/auth/get-profile', asyncHandler(AuthController.getProfile as any));
router.put('/auth/change-password', asyncHandler(AuthController.changePassword as any));
// Tải tập các hình ảnh lên.
router.post('/images/upload', upload.array('images', 10), asyncHandler(AuthController.uploadNewImage));

export default router;