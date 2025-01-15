"use server"
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


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

export const getRandomUsers = async () => {
    try {
        const userId = await getDbUserId()

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } },
                    { NOT: { followers: { some: { followerId: userId } } } }
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true
                    }
                }
            },
            take: 3
        })

        return users;
    } catch (error) {
        console.log("Error in randomUsers", error);
    }

}

export const followUnFollowUser = async (targetId: string) => {
    try {

        const currentUserId = await getDbUserId();

        if (!currentUserId) return;

        if (currentUserId === targetId) {
            throw new Error("You can't follow yourself");
        }

        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetId
                }
            }
        })

        if (existingFollow) {
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: targetId
                    }
                }
            })
        } else {
            await prisma.$transaction([
                prisma.notification.create({
                    data: {
                        userId: targetId,
                        type: "FOLLOW",
                        creatorId: currentUserId
                    }
                }),
                prisma.follows.create({
                    data: {
                        followingId: targetId,
                        followerId: currentUserId
                    }
                })
            ])
        }

        revalidatePath("/")

        return {
            success: true
        }
    } catch (error) {
        console.log("Error in followUnFollowUser", error);
    }
}