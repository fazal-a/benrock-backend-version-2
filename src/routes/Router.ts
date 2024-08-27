import express, {Express} from 'express';

import welcomeRoute from "./default/router";
import authRouter from "./auth/router"
import userRouter from "./user/router";
import postRouter from "./post/router";
import friendshipsRouter from "./friendships/router";

const router: Express = express();

router.use('/', welcomeRoute);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/post', postRouter);
router.use('/friendships', friendshipsRouter);
export default router;