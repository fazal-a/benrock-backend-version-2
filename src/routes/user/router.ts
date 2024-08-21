import { Router } from 'express';
import Controller from "../../controllers/user/controller";

const router = Router();

router.post('/createUser', Controller.createUser);

export default router;
