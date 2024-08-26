import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import Joi from "joi";
import RequestResponseMappings from "../../utils/requestResponseMapping";
import jsonwebtoken from "jsonwebtoken";
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
                console.error("Validation Error", error);
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    error.message || "Validation Error",
                    400
                );
            }

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
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            const newUser = DataSource.manager.create(User, {
                userName: req.body.userName,
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                profileImage: path,
                otp: otp.toString(),
                otpExpires: otpExpires.toString()
            });

            const savedUser = await DataSource.manager.save(newUser);

            const subject = "Email Verification Token";
            const textMessage = `Your email verification token is ${otp} and it expires in 10 minutes.`;
            const heading = "Account Verification";
            const message = "Thank you for registering with us. To complete your email verification, please use the following token:";
            const htmlContent = createHtmlTemplate(heading, message, otp);
            await sendMail(savedUser.email, subject, textMessage, htmlContent);


            return RequestResponseMappings.sendSuccessResponse(res,
                {},
                "User Created Successfully",
                202
            );
        } catch (error) {
            console.error("Validation Error", error);
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
                console.error("Validation Error", error);
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    error.message,
                    400
                );
            }

            const user = await DataSource.manager.findOne(User, {
                where: {email: req.body.email}
            });
            if (!user) {
                console.error("User not found");
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    400
                );
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                console.error("Invalid email or password");
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
            console.error("Failed to Login::", error);
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to Login',
                500
            );
        }
    },

    //Verify the email
    verifyEmail: async (req: Request, res: Response) => {
        try {
            const {email, otp} = req.body;
            const user = await DataSource.manager.findOne(User, {
                where: {email: email}
            });
            if (!user) {
                console.error("User not found!")
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found!",
                    404
                );
            }
            if (
                !user.otp ||
                !user.otpExpires ||
                user.otp !== otp ||
                new Date(user.otpExpires || "").getTime() < Date.now()
            ) {
                console.error("Invalid Token or expired token!")
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid Token or expired token!",
                    400
                );
            }

            user.emailVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            return RequestResponseMappings.sendSuccessResponse(res, {
                token: jsonwebtoken.sign(
                    {email: user.email, id: user.id, userName: user.userName},
                    process.env.JWT_SECRET_KEY || 'jwt secret key here'
                ),
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    gender: user.gender,
                    profileImage: user.profileImage
                },
                message: 'User Created Successfully',
            });
        } catch (error) {
            console.error("Failed to update::", error)
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to update',
                500
            );
        }
    },

    //forget password
    forgotPassword: async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            const user = await DataSource.manager.findOne(User, {
                where: {email: email}
            });
            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found!",
                    404
                );
            }
            // Send verification email
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            user.otp = otp.toString();
            user.otpExpires = otpExpires.toString();
            await user.save();

            const textMessage = `Your password reset token is ${otp} and it expires in 10 minutes`;
            const heading = "Password Reset Request";
            const message = "You are receiving this email because you (or someone else) have requested the reset of the password for your account. Please use the following token to reset your password:";
            const htmlContent = createHtmlTemplate(heading, message, otp);
            const subject = `Password reset token`;
            await sendMail(email, subject, textMessage, htmlContent);
            return RequestResponseMappings.sendSuccessResponse(res,
                {},
                `Password reset token sent to ${email}`,
                202
            );

        } catch (error) {
            console.error("error:::", error)
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to send OTP for forget password.',
                500
            );
        }
    },

    //reset password
    resetPassword: async (req: Request, res: Response) => {
        try {
            const {email, otp, password} = req.body;

            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                otp: Joi.string().min(6).required(),
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

            const user = await DataSource.manager.findOne(User, {
                where: {email: email}
            });
            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found!",
                    404
                );
            }

            if (
                user.otp !== otp ||
                new Date(user.otpExpires || "").getTime() < Date.now()
            ) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid Token or expired token!",
                    400
                );
            }
            user.password = await bcrypt.hash(password, 10);
            user.otp = undefined;
            user.otpExpires = undefined;
            const savedUser = await user.save();

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
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : 'Failed to reset password',
                500
            );
        }
    }
}
