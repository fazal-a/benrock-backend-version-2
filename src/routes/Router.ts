import express, {Express} from 'express';

import welcomeRoute from "./default/router";
import userRouter from "./user/router";
import postRouter from "./post/router"


const router: Express = express();

router.use('/', welcomeRoute);
router.use('/users', userRouter);
router.use('/post', postRouter);
export default router;