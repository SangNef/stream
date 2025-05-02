import express from "express";
import { AuthController, UserAccountController, UserBankController, UserDonateController, UserDonateItemController, UserFollowerController, UserStreamController, UserTransactionController } from "../controllers";
import asyncHandler from "../helpers/asyncHandler";
import AuthMiddleWare from "../middlewares/user.middleware";
import { AuthService } from "../services";

const router = express.Router();

router.post('/signin', asyncHandler(UserAccountController.signin));
router.post('/signup', asyncHandler(UserAccountController.signup));
router.post('/refresh-token', asyncHandler(AuthMiddleWare.checkTokenExpired), asyncHandler(AuthService.providerRefreshToken as any));
router.get('/profile/:user_id', asyncHandler(UserAccountController.getProfileByUserId));

router.use(asyncHandler(AuthMiddleWare.checkAuth));
router.use(asyncHandler(AuthMiddleWare.isRoleCreator));

// Account.
router.get('/profile', asyncHandler(AuthController.getProfile));
router.put('/profile/update', asyncHandler(UserAccountController.updateInfoAcc));
router.put('/change-password', asyncHandler(AuthController.changePassword));
router.delete('/delete', asyncHandler(UserAccountController.deleteAccount));

//Stream
router.get('/stream/get/:streamid', asyncHandler(UserStreamController.getStreamById));
router.get('/streams', asyncHandler(UserStreamController.getAllStreamBySub));
router.get('/stream/top/view', asyncHandler(UserStreamController.getStreamsHot));
router.get('/stream/top/creator/:date', asyncHandler(UserStreamController.getCreatorHot));
router.get('/stream/url/:creator_id', asyncHandler(UserStreamController.getStreamUrlByCreatorId));
router.get('/stream/creator/followed', asyncHandler(UserStreamController.getListStreamOfCreatorFollowed));
router.get('/stream/statistical', asyncHandler(UserStreamController.statisticalByTime));
router.post('/stream/create', asyncHandler(UserStreamController.createStream));
router.put('/stream/update/:streamid', asyncHandler(UserStreamController.updateStream));

// Donate Item
router.get('/donate/items', asyncHandler(UserDonateItemController.getList));

// Comment.
// router.get('/comment/get-by/:stream_id', asyncHandler(UserCommentController.getComments));

//Follower
router.get('/follower/streams', asyncHandler(UserFollowerController.getListStreamInfo));
router.get('/follower/creators', asyncHandler(UserFollowerController.getInfoListCreatorFollowed));
router.post('/follow/:creator_id', asyncHandler(UserFollowerController.addNewFollow));
router.delete('/unfollow/:creator_id', asyncHandler(UserFollowerController.unfollow));

// Transaction.
router.get('/transacton/history', asyncHandler(UserTransactionController.getHistoryTransaction));
router.post('/transaction/add', asyncHandler(UserTransactionController.addNew));

// Donate.
router.get('/donates', asyncHandler(UserDonateController.getListInfoUserDonated));

// Bank
router.get('/banks', asyncHandler(UserBankController.getBanks))
router.post('/bank/add', asyncHandler(UserBankController.addNew));
router.delete('/bank/delete/:bank_id', asyncHandler(UserBankController.delBank));

export default router;