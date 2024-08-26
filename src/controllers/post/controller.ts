import {Request, Response} from 'express';
import Post from '../../entities/Post';
import {uploadImage, uploadVideoWithThumbnail} from "../../helpers/uploadService";
import RequestResponseMappings from "../../utils/requestResponseMapping";
import DataSource from "../../database/database";

export default {
    //create post
    createPost: async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "No file uploaded",
                    400
                );
            }

            const user = req.user;
            const title = req.body.title;
            const description = req.body.description;
            const type = req.body.type;

            let path: string = '';
            let thumbnail: string = '';

            if (type === 'photo') {
                path = await uploadImage(req.file);
            } else if (type === 'video') {
                const result = await uploadVideoWithThumbnail(req.file);
                path = result.video;
                thumbnail = result.thumbnail;
            } else {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid post type",
                    400
                );
            }

            const newPost = DataSource.manager.create(Post,{
                title,
                description,
                type,
                path,
                thumbnail,
                createdBy: user,
            });

            await DataSource.manager.save(newPost);

            return RequestResponseMappings.sendSuccessResponse(
                res,
                {post: newPost},
                "Post created successfully",
                201
            );
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to create Post!",
                500
            );
        }
    },

    //get recent posts
    getRecentPosts: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const [posts, total] = await DataSource.manager.findAndCount(Post,{
                order: {createdAt: 'DESC'},
                take: limit,
                skip: offset,
                relations: ['createdBy'],  // Assuming you want to include user details
            });

            return RequestResponseMappings.sendSuccessResponse(
                res,
                {
                    posts,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                },
                "Recent posts retrieved successfully",
                200
            );
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve recent posts!",
                500
            );
        }
    },

    //get popular posts
    getPopularPosts: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const [posts, total] = await DataSource.manager.findAndCount(Post,{
                order: {likes: 'DESC'},
                take: limit,
                skip: offset,
                relations: ['createdBy'],  // Assuming you want to include user details
            });

            return RequestResponseMappings.sendSuccessResponse(
                res,
                {
                    posts,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                },
                "Popular posts retrieved successfully",
                200
            );
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve popular posts!",
                500
            );
        }
    }
};
