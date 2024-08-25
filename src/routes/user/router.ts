import {Router} from 'express';
import Controller from "../../controllers/user/controller";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";
import multer from "multer";

const router = Router();
const upload = multer();

router.put('/updateProfile', authenticationMiddleware.isAuthentication, upload.single('file'), Controller.updateProfile);
router.get('/profile', authenticationMiddleware.isAuthentication, Controller.getProfile);
router.delete('/deleteProfile', authenticationMiddleware.isAuthentication, Controller.deleteProfile);
router.get('/searchUsers', Controller.searchUsers);
router.get('/getUsers', Controller.getUsers);

export default router;
