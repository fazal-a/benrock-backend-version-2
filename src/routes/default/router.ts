import express, {Express, Request, Response} from 'express';
import RequestResponseMappings from "../../utils/shared/requestResponseMapping";

const router: Express = express();

router.get("/", (req: Request, res: Response) => {
    return RequestResponseMappings.sendSuccessResponse(res,{}, "Welcomee", 200)
},);
export default router;