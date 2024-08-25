import {Router} from 'express';
import Controller from "../../controllers/auth/controller";
import multer from "multer";

const router = Router();
const upload = multer();

router.post('/register',  upload.single('file'),  Controller.register);
router.get('/login', Controller.login);

export default router;
