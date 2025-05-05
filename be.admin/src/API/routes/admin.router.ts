import express from "express";
import AuthMiddleWare from "../middlewares/user.middleware";
import asyncHandler from "../helpers/asyncHandler";
import AuthService from "../services/auth.service";
import { AdminController, AdminDonateController, AdminDonateItemController, AdminHistoryController, AdminStreamController, AdminTransactionController, AuthController } from "../controllers";

const router = express.Router();

router.post('/signin', asyncHandler(AdminController.signin));
router.post('/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired), asyncHandler(AuthService.providerRefreshToken as any));

router.use(asyncHandler(AuthMiddleWare.checkAuth));
router.use(asyncHandler(AuthMiddleWare.isRoleAdmin));
//Admin
router.get('/admins', asyncHandler(AdminController.getListAdmin));
router.get('/profile', asyncHandler(AuthController.getProfile));
router.put('/update/profile', asyncHandler(AdminController.updateAdminAccount));
router.put('/change-password', asyncHandler(AuthController.changePassword));
//User
router.get('/users/user', asyncHandler(AdminController.getListUser));
router.get('/users/creator', asyncHandler(AdminController.getListCreator));
router.get('/users/new/:period', asyncHandler(AdminController.statisticalNewUser));
router.post('/new-user', asyncHandler(AdminController.createNewUserAccount));
router.put('/users/update/:user_id', asyncHandler(AdminController.updateUserAccount));
// Xóa mềm hoặc khôi hục bản ghi tài khoản
router.delete('/users/delete/:id', asyncHandler(AdminController.softDeleteUser));
//Stream
router.get('/stream/streams-by/:creator_id', asyncHandler(AdminStreamController.getStreamsByCreatorID));
router.get('/stream/get-list', asyncHandler(AdminStreamController.getStreams));
router.put('/stream/stop/:stream_id', asyncHandler(AdminStreamController.stopLivestream));

// Transaction.
router.get('/transaction/history/:user_id', asyncHandler(AdminTransactionController.getHistoryTransaction));
router.get('/transaction/get-list', asyncHandler(AdminTransactionController.getTransactions));
router.put('/transaction/toggle/:transaction_id', asyncHandler(AdminTransactionController.toggleTransaction));

// DonateItem.
router.get('/donate/items', asyncHandler(AdminDonateItemController.getList));

router.use(asyncHandler(AuthMiddleWare.isRootAdmin));
// Admin
router.get('/histories', asyncHandler(AdminHistoryController.getHistories));
router.post('/new-admin', asyncHandler(AdminController.signup));
router.delete('/delete/:id', asyncHandler(AdminController.softDeleteAdmin));

// Donate Item
router.post('/donate-item/add', asyncHandler(AdminDonateItemController.addNew));
router.put('/donate-item/update/:id', asyncHandler(AdminDonateItemController.update));
router.delete('/donate-item/delete/:id', asyncHandler(AdminDonateItemController.delOrRestore));

// Donate.
router.get('/donates', asyncHandler(AdminDonateController.getDonate))

export default router;