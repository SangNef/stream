import express from "express";
import { AuthController, UserAccountController, UserCommentController, UserDonateItemController, UserFavouriteController, UserFollowerController, UserStreamController, UserTransactionController } from "../controllers";
import asyncHandler from "../helpers/asyncHandler";
import AuthMiddleWare from "../middlewares/user.middleware";

const router = express.Router();

router.post('/signin', asyncHandler(UserAccountController.signin));
router.post('/signup', asyncHandler(UserAccountController.signup));
router.get('/account/profile/:user_id', asyncHandler(UserAccountController.getProfileByUserId));

router.use(asyncHandler(AuthMiddleWare.checkAuth as any));
router.use(asyncHandler(AuthMiddleWare.isRoleCreator as any));

// Account.
router.get('/get-profile', asyncHandler(AuthController.getProfile as any));
router.put('/account/change-info', asyncHandler(UserAccountController.updateInfoAcc as any));
router.delete('/account/delete-soft', asyncHandler(UserAccountController.deleteAccount as any));

//Stream
router.get('/stream/get-stream/:streamid', asyncHandler(UserStreamController.getStreamById as any));
router.get('/stream/get-all', asyncHandler(UserStreamController.getAllStreamBySub as any));
router.get('/stream/top-most-view', asyncHandler(UserStreamController.getStreamsHot));
router.get('/stream/top-creator-hot/:date', asyncHandler(UserStreamController.getCreatorHot));
router.get('/stream/get-stream-url/:creator_id', asyncHandler(UserStreamController.getStreamUrlByCreatorId));
router.get('/stream/get-list-stream-creator-followed', asyncHandler(UserStreamController.getListStreamOfCreatorFollowed as any));
router.post('/stream/create', asyncHandler(UserStreamController.createStream as any));
router.put('/stream/update/:streamid', asyncHandler(UserStreamController.updateStream));

// Donate Item
router.get('/donate-item/get-list', asyncHandler(UserDonateItemController.getList));

// Comment.
router.get('/comment/get-by/:stream_id', asyncHandler(UserCommentController.getComments));

//Follower
router.get('/follower/get-info-list-stream', asyncHandler(UserFollowerController.getListStreamInfo as any));
router.get('/follower/get-info-list-creator', asyncHandler(UserFollowerController.getInfoListCreatorFollowed as any));
router.post('/follower/add-new-follow/:user_id', asyncHandler(UserFollowerController.addNewFollow as any));
router.delete('/follower/unfollow/:follower_id', asyncHandler(UserFollowerController.unfollow as any));

// Transachtion.
router.get('/transaction/user/donated', asyncHandler(UserTransactionController.getUsersDonated as any));
router.get('/transacton/history', asyncHandler(UserTransactionController.getHistoryTransaction as any));
router.post('/transaction/add', asyncHandler(UserTransactionController.addNew as any));

//Favourite
router.get('/stream-favourite/get-list-follow', asyncHandler(UserFavouriteController.getListStreamFavourite as any));
router.post('/favourite/add-new', asyncHandler(UserFavouriteController.addNew as any));
router.delete('/favourite/unfavorite/:id', asyncHandler(UserFavouriteController.unfavorite as any));

export default router;