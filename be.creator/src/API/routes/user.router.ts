import express from "express";
import { AuthController, UserAccountController, UserBankController, UserDonateController, UserDonateItemController, UserFollowerController, UserStreamController, UserTransactionController } from "../controllers";
import asyncHandler from "../helpers/asyncHandler";
import AuthMiddleWare from "../middlewares/user.middleware";
import { AuthService } from "../services";

const router = express.Router();

router.post('/signin', asyncHandler(UserAccountController.signin));
router.post('/signup', asyncHandler(UserAccountController.signup));
router.post('/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired), asyncHandler(AuthService.providerRefreshToken as any));
router.get('/account/profile/:user_id', asyncHandler(UserAccountController.getProfileByUserId));

router.use(asyncHandler(AuthMiddleWare.checkAuth));
router.use(asyncHandler(AuthMiddleWare.isRoleCreator));

// Account.
router.get('/get-profile', asyncHandler(AuthController.getProfile));
router.put('/account/change-info', asyncHandler(UserAccountController.updateInfoAcc));
router.put('/change-password', asyncHandler(AuthController.changePassword));
router.delete('/account/delete-soft', asyncHandler(UserAccountController.deleteAccount));

//Stream
router.get('/stream/get-stream/:streamid', asyncHandler(UserStreamController.getStreamById));
router.get('/stream/get-all', asyncHandler(UserStreamController.getAllStreamBySub));
router.get('/stream/top-most-view', asyncHandler(UserStreamController.getStreamsHot));
router.get('/stream/top-creator-hot/:date', asyncHandler(UserStreamController.getCreatorHot));
router.get('/stream/get-stream-url/:creator_id', asyncHandler(UserStreamController.getStreamUrlByCreatorId));
router.get('/stream/get-list-stream-creator-followed', asyncHandler(UserStreamController.getListStreamOfCreatorFollowed));
router.get('/stream/statistical', asyncHandler(UserStreamController.statisticalByTime));
router.post('/stream/create', asyncHandler(UserStreamController.createStream));
router.put('/stream/update/:streamid', asyncHandler(UserStreamController.updateStream));

// Donate Item
router.get('/donate-item/get-list', asyncHandler(UserDonateItemController.getList));

// Comment.
// router.get('/comment/get-by/:stream_id', asyncHandler(UserCommentController.getComments));

//Follower
router.get('/follower/get-info-list-stream', asyncHandler(UserFollowerController.getListStreamInfo));
router.get('/follower/get-info-list-creator', asyncHandler(UserFollowerController.getInfoListCreatorFollowed));
router.post('/follower/add-new-follow/:creator_id', asyncHandler(UserFollowerController.addNewFollow));
router.delete('/follower/unfollow/:creator_id', asyncHandler(UserFollowerController.unfollow));

// Transaction.
router.get('/transacton/history', asyncHandler(UserTransactionController.getHistoryTransaction));
router.post('/transaction/add', asyncHandler(UserTransactionController.addNew));

// Donate.
router.get('/donate/get-list', asyncHandler(UserDonateController.getListInfoUserDonated));

// Bank
router.get('/bank/get-list', asyncHandler(UserBankController.getBanks))
router.post('/bank/add', asyncHandler(UserBankController.addNew));
router.delete('/bank/delete/:bank_id', asyncHandler(UserBankController.delBank));

export default router;