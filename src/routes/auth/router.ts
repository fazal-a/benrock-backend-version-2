import {Router} from 'express';
import Controller from "../../controllers/auth/controller";
import multer from "multer";

const router = Router();
const upload = multer();

router.post('/register', upload.single('file'), Controller.register);
router.post('/login', Controller.login);
router.put('/verifyEmail', Controller.verifyEmail);
router.post('/forgotPassword', Controller.forgotPassword);
router.post('/resetPassword', Controller.resetPassword);

export default router;
