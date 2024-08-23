import { Request, Response } from 'express';
import User from "../../entities/User";
import bcrypt from "bcrypt";
import Joi from "joi";
import RequestResponseMappings from "../../utils/shared/requestResponseMapping";
import jsonwebtoken from "jsonwebtoken";
import {getRepository, Like} from "typeorm";
import * as process from "node:process";

export default {
    // Update User Profile
    updateProfile: async (req: Request, res: Response) => {
        try {
            const schema = Joi.object({
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                username: Joi.string().optional(),
                gender: Joi.string().optional(),
                profileImage: Joi.string().optional(),
            });

            const { error } = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    { error },
                    error.message || 'Failed to register',
                    400
                );
            }

            const userRepository = getRepository(User);
            const user = await userRepository.findOne({
                where: { id: req.user?.id }
            });

            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    404
                );
            }

            const updatedUser = Object.assign(user, req.body);
            console.log("updatedUser::",updatedUser)
            const savedUser = await userRepository.save(updatedUser);
            console.log("savedUser::",savedUser)

            return RequestResponseMappings.sendSuccessResponse(res, {
                user: {
                    id: savedUser.id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    username: savedUser.username,
                    email: savedUser.email,
                    gender: savedUser.gender,
                    profileImage: savedUser.profileImage
                }
            }, "Profile updated successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                { error },
                error instanceof Error ? error.message : "Failed to update profile",
                500
            );
        }
    },

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
                profileImage: Joi.string().optional(),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    { error },
                    error.message || "Validation Error",
                    400
                );
            }

            const userRepository = getRepository(User);
            const existingUser = await userRepository.findOne({
                where: { email: req.body.email }
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
            const newUser = userRepository.create({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                profileImage: req.body.profileImage,
            });

            const savedUser = await userRepository.save(newUser);
            return RequestResponseMappings.sendSuccessResponse(res, {
                token: jsonwebtoken.sign(
                    { email: savedUser.email, id: savedUser.id },
                    process.env.JWT_SECRET_KEY || "secret"
                ),
                user: {
                    id: savedUser.id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    username: savedUser.username,
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
                error instanceof Error ? error.message : 'Failed to register',
                500
            );
        }
    },

    // Login a user
    login: async (req: Request, res: Response) => {
        try {
            const asdf = process.env.ASDF || 'some text';
            console.log("asdffff:::",asdf)
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    { error },
                    error.message,
                    400
                );
            }

            const userRepository = getRepository(User);
            const user = await userRepository.findOne({
                where: { email: req.body.email }
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
                { email: user.email, id: user.id },
                process.env.JWT_SECRET_KEY || "secret"
            );

            return RequestResponseMappings.sendSuccessResponse(res, {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    gender: user.gender,
                    profileImage: user.profileImage
                },
                message: 'Login Successful',
            });
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                { error },
                error instanceof Error ? error.message : 'Failed to Login',
                500
            );
        }
    },

    // Get authenticated user's profile
    getProfile: async (req: Request, res: Response) => {
        try {
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({
                where: { email: req?.user?.email }
            });

            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    404
                );
            }

            return RequestResponseMappings.sendSuccessResponse(res, {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    gender: user.gender,
                    profileImage: user.profileImage
                },
                message: 'Profile found',
            });
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                { error },
                error instanceof Error ? error.message : "Failed to retrieve user profile",
                500
            );
        }
    },

    // Delete user account
    deleteAccount: async (req: Request, res: Response) => {
        try {

            const userId = req.query.id;

            // Validate that userId is provided
            if (!userId) {
                throw new Error("User Id is required");
            }

            const userRepository = getRepository(User);
            const deleteResult = await userRepository.delete(userId as string);
            console.log("deleteResult:::", deleteResult)

            // Check if a user was deleted
            if (deleteResult.affected && deleteResult.affected > 0) {
                return RequestResponseMappings.sendSuccessResponse(
                    res,
                    {},
                    "Account deleted successfully.",
                    200
                );
            } else {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found.",
                    404
                );
            }

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve user profile",
                500
            );
        }
    },

    // Search Users
    searchUsers: async (req: Request, res: Response) => {
        try {
            const { searchTerm } = req.query;
            console.log("searchTerm::::",searchTerm)
            if (!searchTerm) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Search term is required",
                    400
                );
            }

            const userRepository = getRepository(User);
            const users = await userRepository.find({
                where: [
                    { username: Like(`%${searchTerm}%`) },
                    { firstName: Like(`%${searchTerm}%`) },
                    { lastName: Like(`%${searchTerm}%`) },
                ],
                select: ["id", "firstName", "lastName", "username", "email", "gender", "profileImage"]
            });

            return RequestResponseMappings.sendSuccessResponse(res, {
                users
            }, "Users retrieved successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                { error },
                error instanceof Error ? error.message : "Failed to search users",
                500
            );
        }
    },

    // Get List of Users
    getUsers: async (req: Request, res: Response) => {
        try {
            const userRepository = getRepository(User);
            const users = await userRepository.find({
                select: ["id", "firstName", "lastName", "username", "email", "gender", "profileImage"]
            });

            return RequestResponseMappings.sendSuccessResponse(res, {
                users
            }, "Users retrieved successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                { error },
                error instanceof Error ? error.message : "Failed to retrieve users",
                500
            );
        }
    }
}

