import {Router} from 'express';
import multer from 'multer';
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";
import Controller from "../../controllers/post/controller";


const router = Router();
const upload = multer();

router.post('/create', authenticationMiddleware.isAuthentication, upload.single('file'), Controller.createPost);
router.get('/recent',  upload.single('file'), Controller.getRecentPosts);
router.get('/popular', upload.single('file'), Controller.getPopularPosts);
export default router;
