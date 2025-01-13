"use server"

import prisma from "@/lib/prisma"
import { getDbUserId } from "./user.actions"
import { revalidatePath } from "next/cache"

export const createPost = async (content: string, image: string) => {
    try {
        const userId = await getDbUserId()

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