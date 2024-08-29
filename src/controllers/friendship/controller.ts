import {Request, Response} from 'express';
import User from '../../entities/User';
import DataSource from "../../database/database";
import RequestResponseMappings from "../../utils/requestResponseMapping";
import FriendRequest from "../../entities/FriendRequest";
import Friendship from "../../entities/Friendship";

export default {
    // Get recommended users (users who are not friends and haven't sent/received friend requests)
    getRecommendedUsers: async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;

            // Ensure the user exists
            const user = await DataSource.manager.findOne(User, {where: {id: userId}});
            if (!user) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    404
                );
            }

            console.log("user::::", user)

            // Query to get recommended users
            const recommendedUsers = await DataSource.manager.createQueryBuilder(User, "user")
                .leftJoin(FriendRequest, "sentRequest", "(sentRequest.senderId = :userId AND sentRequest.receiverId = user.id)", {userId})
                .leftJoin(FriendRequest, "receivedRequest", "(receivedRequest.receiverId = :userId AND receivedRequest.senderId = user.id)", {userId})
                .leftJoin(Friendship, "friendship1", "(friendship1.user1Id = :userId AND friendship1.user2Id = user.id)", {userId})
                .leftJoin(Friendship, "friendship2", "(friendship2.user2Id = :userId AND friendship2.user1Id = user.id)", {userId})
                .where("sentRequest.id IS NULL")
                .andWhere("receivedRequest.id IS NULL")
                .andWhere("friendship1.id IS NULL")
                .andWhere("friendship2.id IS NULL")
                .andWhere("user.id != :userId", {userId})
                .select(["user.id", "user.firstName", "user.lastName", "user.userName", "user.profileImage"])
                .getMany();

            return RequestResponseMappings.sendSuccessResponse(res, {
                users: recommendedUsers
            }, "Recommended users retrieved successfully");

        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve recommended users",
                500
            );
        }
    },

    // Send friend request
    sendFriendRequest: async (req: Request, res: Response) => {
        try {
            const senderId = req.user?.id as number;
            const receiverId = req.body.receiverId as number;

            if (senderId == receiverId) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Can not send friend request to your self!",
                    404
                );
            }

            const receiver = await DataSource.manager.findOne(User, {
                where: {id: receiverId}
            });

            if (!receiver) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "User not found",
                    404
                );
            }

            const existingRequest = await DataSource.manager.findOne(FriendRequest, {
                where: {sender: {id: senderId}, receiver: {id: receiverId}}
            });

            if (existingRequest) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Friend request already sent",
                    400
                );
            }

            const sender = await DataSource.manager.findOne(User, {
                where: {id: senderId}
            });

            const friendRequest = DataSource.manager.create(FriendRequest, {
                sender: sender!,
                receiver: receiver
            });
            const savedFriendRequest = await DataSource.manager.save(friendRequest);

            return RequestResponseMappings.sendSuccessResponse(res, {
                savedFriendRequest
            }, "Friend request sent successfully");
        } catch (error) {
            console.error("caught error", error)
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to send friend request",
                500
            );
        }
    },

    // Get received friend requests
    getFriendRequests: async (req: Request, res: Response) => {
        try {
            const user = await DataSource.manager.findOne(User, {
                where: {id: req.user?.id},
                relations: ["receivedRequests", "receivedRequests.sender"]
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
                friendRequests: user.receivedRequests
            }, "Friend requests retrieved successfully");
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve friend requests",
                500
            );
        }
    },

    // Accept or reject friend request
    handleFriendRequest: async (req: Request, res: Response) => {
        try {
            const requestId = req.body.requestId;
            const action = req.body.action;  // 'accept' or 'reject'
            console.log("requestId:::", requestId, "action:::", action)


            const friendRequest = await DataSource.manager.findOne(FriendRequest, {
                where: {id: requestId},
                relations: ["sender", "receiver"]
            });


            console.log("friendRequest:::", friendRequest)

            if (!friendRequest) {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Friend request not found",
                    404
                );
            }

            if (action === 'accept') {
                const friendship = Friendship.createOrderedFriendship(friendRequest.sender, friendRequest.receiver);
                const savedFriendship = await DataSource.manager.save(friendship);
                friendRequest.isAccepted = true;
                const savedFriendRequest = await DataSource.manager.save(friendRequest);
                console.log("savedFriendship::", savedFriendship, "savedFriendRequest:::", savedFriendRequest)

                return RequestResponseMappings.sendSuccessResponse(res, {
                        savedFriendship
                    },
                    "Friend request accepted",);
            } else if (action === 'reject') {
                await DataSource.manager.delete(FriendRequest, requestId);

                return RequestResponseMappings.sendSuccessResponse(res,
                    {}, "Friend request rejected");
            } else {
                return RequestResponseMappings.sendErrorResponse(
                    res,
                    {},
                    "Invalid action",
                    400
                );
            }
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to handle friend request",
                500
            );
        }
    },

    // Get received friend requests
    getFriends: async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            const friends = await DataSource.manager.createQueryBuilder(User, "user")
                .innerJoin(Friendship, "friendship", "(friendship.user1Id = :userId AND friendship.user2Id = user.id) OR (friendship.user2Id = :userId AND friendship.user1Id = user.id)", {userId})
                .select(["user.id", "user.firstName", "user.lastName", "user.userName", "user.profileImage"])
                .getMany();
            console.log("friends:::", friends)

            // if (!user) {
            //     return RequestResponseMappings.sendErrorResponse(
            //         res,
            //         {},
            //         "User not found",
            //         404
            //     );
            // }

            return RequestResponseMappings.sendSuccessResponse(res, {
                friends: friends
            }, "Friends retrieved successfully");
        } catch (error) {
            return RequestResponseMappings.sendErrorResponse(
                res,
                {error},
                error instanceof Error ? error.message : "Failed to retrieve friend requests",
                500
            );
        }
    },

    // Get friends' posts
    // getFriendsPosts: async (req: Request, res: Response) => {
    //     try {
    //         const page = parseInt(req.query.page as string) || 1;
    //         const limit = parseInt(req.query.limit as string) || 10;
    //         const offset = (page - 1) * limit;
    //
    //         // Using query builder to get friends' posts
    //         const [posts, total] = await DataSource.manager.createQueryBuilder(Post, "post")
    //             .innerJoin("post.createdBy", "user")
    //             .innerJoin("user.friends", "friend", "friend.user1 = :userId OR friend.user2 = :userId", { userId: req.user?.id })
    //             .orderBy("post.createdAt", "DESC")
    //             .skip(offset)
    //             .take(limit)
    //             .getManyAndCount();
    //
    //         return RequestResponseMappings.sendSuccessResponse(res, {
    //             posts,
    //             currentPage: page,
    //             totalPages: Math.ceil(total / limit),
    //             totalItems: total,
    //         }, "Friends' posts retrieved successfully");
    //     } catch (error) {
    //         return RequestResponseMappings.sendErrorResponse(
    //             res,
    //             { error },
    //             error instanceof Error ? error.message : "Failed to retrieve friends' posts",
    //             500
    //         );
    //     }
    // }
    // Like a friend's post

    // //likePost of friend
    // likePost: async (req: Request, res: Response) => {
    //     try {
    //         const postId = req.body.postId;
    //         const post = await DataSource.manager.findOne(Post, {
    //             where: { id: postId },
    //             relations: ["createdBy"]
    //         });
    //
    //         if (!post) {
    //             return RequestResponseMappings.sendErrorResponse(
    //                 res,
    //                 {},
    //                 "Post not found",
    //                 404
    //             );
    //         }
    //
    //         post.likes += 1;
    //         await DataSource.manager.save(post);
    //
    //         return RequestResponseMappings.sendSuccessResponse(res, {
    //             post
    //         }, "Post liked successfully");
    //     } catch (error) {
    //         return RequestResponseMappings.sendErrorResponse(
    //             res,
    //             { error },
    //             error instanceof Error ? error.message : "Failed to like post",
    //             500
    //         );
    //     }
    // }
};
