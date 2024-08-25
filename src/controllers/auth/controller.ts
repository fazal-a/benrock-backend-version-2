import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import Joi from "joi";
import RequestResponseMappings from "../../utils/requestResponseMapping";
import jsonwebtoken from "jsonwebtoken";
import {getRepository} from "typeorm";
import * as process from "node:process";
import {uploadImage} from "../../helpers/uploadService";
import {sendMail} from "../../utils/sendMail";
import {createHtmlTemplate} from "../../utils/generateHTML";
import User from "../../entities/User";
import DataSource from "../../database/database";

export default {
    //register
    register: async (req: Request, res: Response) => {

        try {
            console.log("i am herereeee")
            const schema = Joi.object({
                userName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                gender: Joi.string().optional(),
            });
            const {error} = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    error.message || "Validation Error",
                    400
                );
            }

            // const userRepository = getRepository(User);
            // const userRepository = await DataSource.manager.find(User);
            // const existingUser = await userRepository.findOne({
            //     where: {email: req.body.email}
            // });
            // const userRepository = await DataSource.manager.find(User);
            const existingUser = await DataSource.manager.findOne(User, {
                where: {email: req.body.email}
            });

            if (existingUser) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User already exists",
                    400
                );
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            let path = '';
            if (req.file) {
                path = await uploadImage(req.file);
            }

            // Send verification email
            const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
            const emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

            const newUser = userRepository.create({
                userName: req.body.userName,
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                profileImage: path,
                emailVerificationToken: emailVerificationToken.toString(),
                emailVerificationTokenExpires: emailVerificationTokenExpires.toString()
            });
            console.log("newUser:::", newUser)

            const savedUser = await userRepository.save(newUser);
            console.log("savedUser:::", savedUser)

            const subject = "Email Verification Token";
            const textMessage = `Your email verification token is ${emailVerificationToken} and it expires in 10 minutes.`;
            const heading = "Account Verification";
            const message = "Thank you for registering with us. To complete your email verification, please use the following token:";
            const htmlContent = createHtmlTemplate(heading, message, emailVerificationToken);
            await sendMail(savedUser.email, subject, textMessage, htmlContent);


            return RequestResponseMappings.sendSuccessResponse(res, {
                token: jsonwebtoken.sign(
                    {email: savedUser.email, id: savedUser.id, userName: savedUser.userName},
                    process.env.JWT_SECRET_KEY || 'jwt secret key here'
                ),
                user: {
                    id: savedUser.id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    userName: savedUser.userName,
                    email: savedUser.email,
                    gender: savedUser.gender,
                    profileImage: savedUser.profileImage
                },
                message: 'User Created Successfully',
            });
        } catch (error) {
            console.error("error:::", error)
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to register',
                500
            );
        }
    },

    // Login a user
    login: async (req: Request, res: Response) => {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
            });
            const {error} = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    error.message,
                    400
                );
            }

            const userRepository = getRepository(User);
            const user = await userRepository.findOne({
                where: {email: req.body.email}
            });
            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid email or password",
                    400
                );
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid email or password",
                    400
                );
            }

            const token = jsonwebtoken.sign(
                {email: user.email, id: user.id, userName: user.userName},
                process.env.JWT_SECRET_KEY || 'jwt secret key here'
            );

            return RequestResponseMappings.sendSuccessResponse(res, {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    gender: user.gender,
                    profileImage: user.profileImage
                },
                message: 'Login Successful',
            });
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to Login',
                500
            );
        }
    },

}
