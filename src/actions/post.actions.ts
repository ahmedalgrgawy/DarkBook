"use server"

import prisma from "@/lib/prisma"
import { getDbUserId } from "./user.actions"
import { revalidatePath } from "next/cache"

export const createPost = async (content: string, image: string) => {
    try {
        const userId = await getDbUserId()

        if (!userId) return;

        const newPost = await prisma.post.create({
            data: {
                content,
                image,
                authorId: userId
            }
        })

        revalidatePath("/")
        return {
            success: true,
            newPost
        }

    } catch (error) {
        console.error("Failed to create post:", error);
    }
}

export const getPosts = async () => {
    try {

        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true
                    }
                },
                comments: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                username: true
                            }
                        }
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            }
        })

        return posts;
    } catch (error) {
        console.error("Failed to get posts:", error);
    }
}

export const toggleLikes = async (postId: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        // check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });

        if (!post) throw new Error("Post not found");

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
        } else {
            await prisma.$transaction([
                prisma.like.create({
                    data: {
                        userId,
                        postId,
                    },
                }),
                ...(post.authorId !== userId
                    ? [
                        prisma.notification.create({
                            data: {
                                type: "LIKE",
                                userId: post.authorId, // recipient (post author)
                                creatorId: userId, // person who liked
                                postId,
                            },
                        }),
                    ]
                    : []),
            ]);
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}