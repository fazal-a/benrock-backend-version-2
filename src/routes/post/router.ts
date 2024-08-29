import {Router} from 'express';
import multer from 'multer';
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";
import Controller from "../../controllers/post/controller";


const router = Router();
const upload = multer();

router.post('/create', authenticationMiddleware.isAuthentication, upload.single('file'), Controller.createPost);
router.get('/recent', Controller.getRecentPosts);
router.get('/popular', Controller.getPopularPosts); // problem with it - adjust the like field to get likes from the likes table
router.get('/getFriendsPosts', authenticationMiddleware.isAuthentication, Controller.getFriendsPosts);
router.post('/likePost', authenticationMiddleware.isAuthentication, Controller.likePost);
router.get('/addImpression', authenticationMiddleware.isAuthentication, Controller.addImpression);
export default router;
