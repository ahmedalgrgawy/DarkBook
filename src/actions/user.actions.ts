"use server"
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";


export const syncUser = async () => {
    try {
        const user = await currentUser()
        const { userId } = await auth()

        if (!userId || !user) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (existingUser) return existingUser;

        const newUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            }
        })

        return newUser;

    } catch (error) {
        console.log("Error in syncUser", error);
    }
}

export const getUserByClerkId = async (clerkId: string) => {
    return prisma.user.findUnique({
        where: {
            clerkId
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                }
            }
        }
    })
}

export const getDbUserId = async () => {
    const { userId: clerkId } = await auth()

    if (!clerkId) throw new Error("Unauthorized")

    const user = await getUserByClerkId(clerkId)

    if (!user) throw new Error("User Not Found");

    return user.id
}

