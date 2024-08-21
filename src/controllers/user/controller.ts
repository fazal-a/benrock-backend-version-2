import { Request, Response } from 'express';
import User from "../../entities/User";
import bcrypt from "bcrypt";
import Joi from "joi";
import RequestResponseMappings from "../../utils/shared/requestResponseMapping";
import jsonwebtoken from "jsonwebtoken";
import {getRepository} from "typeorm";
import controller from './controller';

export default {
    createUser: async (req: Request, res: Response) => {
        try {
            const schema = Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
            });
            const {error} = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    "failure in validation of body object schema",
                    400
                )
            }
            //check if user already exists
            const userRepository = getRepository(User);
            const existingUser = await userRepository.findOne({
                where:
                    {
                        email:req.body.email
                    }
            });
            if (existingUser) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User Already exists against the email",
                    400
                )
            }
            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Create new user
            const newUser = userRepository.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            });

            const savedUser = await userRepository.save(newUser);
            return controller.sendTokenWithPayload(res, savedUser);
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                "Failed to create user",
                500
            )
        }
    },

    sendTokenWithPayload: (res: Response, user: User) => {
        return RequestResponseMappings.sendSuccessResponse(res, {
            token: jsonwebtoken.sign(
                {email: user.email, password: user.password},
                process.env.JWT_SECRET_KEY|| "secret"),
            user: user
        })
    },
}

