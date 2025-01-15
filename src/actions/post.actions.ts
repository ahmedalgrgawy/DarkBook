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