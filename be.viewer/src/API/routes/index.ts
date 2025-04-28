import express from "express";
import userRouter from "./user.router";
import AuthMiddleWare from "../middlewares/user.middleware";
import AuthController from "../controllers/auth.controller";
import asyncHandler from "../helpers/asyncHandler";
import { upload } from "../helpers/multer";

const router = express.Router();

router.use('/user', userRouter);
router.use(asyncHandler(AuthMiddleWare.checkAuth));

// Tải tập các hình ảnh lên.
router.post('/images/upload', upload.array('images', 10), asyncHandler(AuthController.uploadNewImage));

export default router;