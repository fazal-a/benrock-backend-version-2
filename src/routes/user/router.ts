import {Router} from 'express';
import Controller from "../../controllers/user/controller";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";

const router = Router();

router.post('/register', Controller.register);
router.get('/login', Controller.login);
router.put('/updateProfile', authenticationMiddleware.isAuthentication, Controller.updateProfile);
router.get('/profile', authenticationMiddleware.isAuthentication, Controller.getProfile);
router.delete('/deleteProfile', authenticationMiddleware.isAuthentication, Controller.deleteProfile);
router.get('/searchUsers', Controller.searchUsers);
router.get('/getUsers', Controller.getUsers);

export default router;
