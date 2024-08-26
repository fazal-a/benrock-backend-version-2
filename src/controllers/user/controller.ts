import {Request, Response} from 'express';
import User from "../../entities/User";
import Joi from "joi";
import RequestResponseMappings from "../../utils/requestResponseMapping";
import {Like} from "typeorm";
import {uploadImage} from "../../helpers/uploadService";
import DataSource from "../../database/database";


export default {
    // Update User Profile
    updateProfile: async (req: Request, res: Response) => {
        try {
            const schema = Joi.object({
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                gender: Joi.string().optional(),
            });

            const {error} = schema.validate(req.body);
            if (error) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {error},
                    error.message || 'Failed to register',
                    400
                );
            }

            const user = await DataSource.manager.findOne(User, {
                where: {id: req.user?.id}
            });

            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    404
                );
            }

            // Handle profile image path if provided
            let profileImagePath = user.profileImage; // Retain existing profile image if no new image is uploaded

            if (req.file) {
                profileImagePath = await uploadImage(req.file); // Upload new image and get path
            }

            // Update user data
            const updatedUser = Object.assign(user, req.body, {
                profileImage: profileImagePath,
            });

            const savedUser = await DataSource.manager.save(updatedUser);

            return RequestResponseMappings.sendSuccessResponse(res, {
                user: {
                    id: savedUser.id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    userName: savedUser.userName,
                    email: savedUser.email,
                    gender: savedUser.gender,
                    profileImage: savedUser.profileImage
                }
            }, "Profile updated successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to update profile",
                500
            );
        }
    },

    // Get authenticated user's profile
    getProfile: async (req: Request, res: Response) => {
        try {
            const user = await DataSource.manager.findOne(User,{
                where: {email: req?.user?.email}
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
                    userName: user.userName,
                    email: user.email,
                    gender: user.gender,
                    profileImage: user.profileImage
                },
                message: 'Profile found',
            });
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve user profile",
                500
            );
        }
    },

    // Delete user account
    deleteProfile: async (req: Request, res: Response) => {
        try {
            const userId = req.query.id;
            // Validate that userId is provided
            if (!userId) {
                throw new Error("User Id is required");
            }

            const deleteResult = await DataSource.manager.delete(User, userId as string);

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
            const {searchTerm} = req.query;
            console.log("searchTerm::::", searchTerm)
            if (!searchTerm) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Search term is required",
                    400
                );
            }

            const users = await DataSource.manager.find(User,{
                where: [
                    {userName: Like(`%${searchTerm}%`)},
                    {firstName: Like(`%${searchTerm}%`)},
                    {lastName: Like(`%${searchTerm}%`)},
                ],
                select: ["id", "firstName", "lastName", "userName", "email", "gender", "profileImage"]
            });

            return RequestResponseMappings.sendSuccessResponse(res, {
                users
            }, "Users retrieved successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to search users",
                500
            );
        }
    },

    // Get List of Users
    getUsers: async (req: Request, res: Response) => {
        try {
            const users = await DataSource.manager.find(User,{
                select: ["id", "firstName", "lastName", "userName", "email", "gender", "profileImage"]
            });

            return RequestResponseMappings.sendSuccessResponse(res, {
                users
            }, "Users retrieved successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve users",
                500
            );
        }
    }
}

