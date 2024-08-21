import express,{Express} from 'express';

import welcomeRoute from "./default/router";
import userRouter from "./user/router";


const router: Express = express();

router.use('/',welcomeRoute);
router.use('/users',userRouter);
export default router;