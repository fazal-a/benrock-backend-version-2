import {Router} from 'express';
import multer from 'multer';
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";
import Controller from "../../controllers/post/controller";


const router = Router();
const upload = multer();

router.post('/create', authenticationMiddleware.isAuthentication, upload.single('file'), Controller.createPost);
export default router;
