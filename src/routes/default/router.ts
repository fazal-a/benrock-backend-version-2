import express, {Express, Request, Response} from 'express';
import RequestResponseMappings from "../../utils/requestResponseMapping";

const router: Express = express();

router.get("/sendmail", (req: Request, res: Response) => {
    return RequestResponseMappings.sendSuccessResponse(res,{}, "Welcome", 200)
},);
export default router;