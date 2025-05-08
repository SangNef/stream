import express from "express";
import AuthMiddleWare from "../middlewares/user.middleware";
import asyncHandler from "../helpers/asyncHandler";
import { AuthController, UserAccountController, UserBankController, UserDonateItemController, UserFollowerController, UserStreamController, UserTransactionController } from "../controllers";
import { upload } from "../helpers/multer";
import UserCommentController from "../controllers/comment.controller";
import { AuthService } from "../services";
import RedisCommentController from "../controllers/redis.comment.controller";

const router = express.Router();

router.post('/signin', asyncHandler(UserAccountController.signin));
router.post('/signup', asyncHandler(UserAccountController.signup));
router.post('/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired as any), asyncHandler(AuthService.providerRefreshToken as any));
router.get('/profile/:user_id', asyncHandler(UserAccountController.getProfileByUserId));

router.use(asyncHandler(AuthMiddleWare.checkAuth));
router.use(asyncHandler(AuthMiddleWare.isRoleUser));

// Account.
router.get('/profile', asyncHandler(AuthController.getProfile));
router.post("/logout", asyncHandler(UserAccountController.logout));
router.put('/profile/update', asyncHandler(UserAccountController.updateInfoAcc));
router.put('/change-password', asyncHandler(AuthController.changePassword));
router.delete('/delete', asyncHandler(UserAccountController.deleteAccount));

//Stream
router.get('/streams/:creator_id', asyncHandler(UserStreamController.getAllStreamBySub));
router.get('/stream/top/view', asyncHandler(UserStreamController.getStreamsHot));
router.get('/stream/top/creator/:date', asyncHandler(UserStreamController.getCreatorHot));
router.get('/stream/url/:creator_id', asyncHandler(UserStreamController.getStreamUrlByCreatorId));
router.get('/stream/creator/followed', asyncHandler(UserStreamController.getListStreamOfCreatorFollowed));

// Donate Item.
router.get('/donate/items', asyncHandler(UserDonateItemController.getList));

// Comment.
router.get('/comments/:stream_id', asyncHandler(RedisCommentController.getComments));
// router.get('/comment/get-by/:stream_id', asyncHandler(UserCommentController.getComments));

//Follower
router.get('/follower/creators', asyncHandler(UserFollowerController.getInfoListCreatorFollowed));
router.get('/follower/streams', asyncHandler(UserFollowerController.getListStreamInfo));
router.post('/follow/:creator_id', asyncHandler(UserFollowerController.addNewFollow));
router.delete('/unfollow/:creator_id', asyncHandler(UserFollowerController.unfollow));

// Transaction.
router.get('/transacton/history', asyncHandler(UserTransactionController.getHistoryTransaction));
router.post('/transaction/add', asyncHandler(UserTransactionController.addNew));

// Bank
router.get('/banks', asyncHandler(UserBankController.getBanks))
router.post('/bank/add', asyncHandler(UserBankController.addNew));
router.delete('/bank/delete/:bank_id', asyncHandler(UserBankController.delBank));

export default router;