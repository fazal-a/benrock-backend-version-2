import {NextFunction, Request, Response} from "express";
import jsonwebtoken from 'jsonwebtoken';
import RequestResponseMappings from '../utils/shared/requestResponseMapping';

export default {
    isAuthentication:(req:Request,res:Response,next:NextFunction)=>{
        let token=req.header('Authorization')?.split(' ')[1]
        if (!token) {
            return RequestResponseMappings.sendErrorResponse(res,{},'Access Denied: No Token Provided',401);
        }
        try{
            const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY || "secret");
            req.user = decoded as { id: number, email: string, name: string }; // Ensure this matches the interface extension
            next();
        }catch (e:any) {
            return RequestResponseMappings.sendErrorResponse(res,{},e instanceof Error ? e.message : 'Failed to authenticate',401);
        }
    }
}
