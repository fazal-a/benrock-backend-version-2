import {Router} from 'express';
import Controller from "../../controllers/friendship/controller";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";

const router = Router();

router.get('/getRecommendedUsers', authenticationMiddleware.isAuthentication, Controller.getRecommendedUsers);
router.post('/sendFriendRequest', authenticationMiddleware.isAuthentication, Controller.sendFriendRequest);
router.get('/getFriendRequests', authenticationMiddleware.isAuthentication, Controller.getFriendRequests);
router.post('/handleFriendRequest', authenticationMiddleware.isAuthentication, Controller.handleFriendRequest);
router.get('/getFriends', authenticationMiddleware.isAuthentication, Controller.getFriends);

export default router;
