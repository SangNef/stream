import express from "express";
import AuthMiddleWare from "../middlewares/user.middleware";
import asyncHandler from "../helpers/asyncHandler";
import AuthService from "../services/auth.service";
import { AdminController, AdminDonateItemController, AdminHistoryController, AdminStreamController, AdminTransactionController } from "../controllers";

const router = express.Router();

router.post('/signin', asyncHandler(AdminController.signin));
router.post('/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired as any), asyncHandler(AuthService.providerRefreshToken as any));

router.use(asyncHandler(AuthMiddleWare.checkAuth as any));
router.use(asyncHandler(AuthMiddleWare.isRoleAdmin as any));
//Admin
router.get('/get-list', asyncHandler(AdminController.getListAdmin as any));
router.put('/update/profile', asyncHandler(AdminController.updateAdminAccount as any));
//User
router.get('/get-list/user/role-user', asyncHandler(AdminController.getListUser));
router.get('/get-list/user/role-creator', asyncHandler(AdminController.getListCreator));
router.post('/create-new-user', asyncHandler(AdminController.createNewUserAccount as any));
router.put('/update/user/:user_id', asyncHandler(AdminController.updateUserAccount as any));
// Xóa mềm hoặc khôi hục bản ghi tài khoản
router.delete('/soft-delete-user/:id', asyncHandler(AdminController.softDeleteUser as any));
//Stream
router.get('/stream/get-all-stream-by-creator/:creator_id', asyncHandler(AdminStreamController.getStreamsByCreatorID));
router.get('/stream/get-streams-living', asyncHandler(AdminStreamController.getAllStreamLiving));
router.get('/stream/get-streams-stop', asyncHandler(AdminStreamController.getAllStreamStop));
router.put('/stream/stop-stream/:stream_id', asyncHandler(AdminStreamController.stopLivestream as any));

// Transaction.
router.get('/transaction/history/:user_id', asyncHandler(AdminTransactionController.getHistoryTransaction));
router.get('/transaction/get-list', asyncHandler(AdminTransactionController.getTransactions as any));
router.put('/transaction/submit/:transaction_id', asyncHandler(AdminTransactionController.submitTransaction as any));
router.put('/transaction/cancel/:transaction_id', asyncHandler(AdminTransactionController.cancelTransaction as any));

// DonateItem.
router.get('/donate-item/get-list', asyncHandler(AdminDonateItemController.getList));

router.use(asyncHandler(AuthMiddleWare.isRootAdmin as any));
// Admin
router.get('/history/get-list', asyncHandler(AdminHistoryController.getHistories));
router.delete('/delete/:id', asyncHandler(AdminController.softDeleteAdmin as any));
router.post('/create-new-admin', asyncHandler(AdminController.signup as any));

// Donate Item
router.post('/donate-item/add', asyncHandler(AdminDonateItemController.addNew));
router.put('/donate-item/update/:id', asyncHandler(AdminDonateItemController.update));
router.delete('/donate-item/delete/:id', asyncHandler(AdminDonateItemController.delOrRestore));

export default router;