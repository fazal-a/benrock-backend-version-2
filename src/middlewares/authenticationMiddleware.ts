import {NextFunction, Request, Response} from "express";
import jsonwebtoken from 'jsonwebtoken';
import RequestResponseMappings from '../utils/requestResponseMapping';
import User from "../entities/User";
import * as process from "node:process";
import DataSource from "../database/database";

export default {
    isAuthentication: async (req: Request, res: Response, next: NextFunction) => {
        let token = req.header('Authorization')?.split(' ')[1]
        if (!token) {
            return RequestResponseMappings.sendErrorResponse(res, {}, 'Access Denied: No Token Provided', 401);
        }
        try {
            const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY || 'jwt secret key here');
            req.user = decoded as { email: string, id: number, userName: string }; // Ensure this matches the interface extension
            // Validate if the user still exists in the database
            const user = await DataSource.manager.findOne(User, {
                where: {email: req.user.email, id: req.user.id, userName: req.user.userName}
            });
            if (!user) {
                return RequestResponseMappings.sendErrorResponse(res, {}, 'Access Denied: User no longer exists', 401);
            }
            next();
        } catch (e: any) {
            return RequestResponseMappings.sendErrorResponse(res, {}, e instanceof Error ? e.message : 'Failed to authenticate', 401);
        }
    }
}
