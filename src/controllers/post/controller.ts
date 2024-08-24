import {Request, Response} from 'express';
import Post from '../../entities/Post';
import {getRepository} from 'typeorm';
import {uploadImage, uploadVideoWithThumbnail} from "../../helpers/uploadService";
import RequestResponseMappings from "../../utils/shared/requestResponseMapping";

export default {
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
            const type = req.body.type;

            let path: string = '';
            let thumbnail: string = '';

            if (type === 'photo' || 'image' || 'png' || 'jpg') {
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

            const postRepository = getRepository(Post);
            const newPost = postRepository.create({
                type,
                path,
                thumbnail,
                createdBy: user,
            });

            await postRepository.save(newPost);

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

    // Define additional methods for liking, viewing, etc.
};
