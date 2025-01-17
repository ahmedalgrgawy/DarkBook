import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.actions"
import ProfilePage from "@/Components/ProfilePage"
import { notFound } from "next/navigation"

export const generateMetadata = async ({ params }: { params: { username: string } }) => {

    const user = await getProfileByUsername(params.username)

    return {
        title: `${user?.username || user?.name} | Dark-Book`,
    }
}

const page = async ({ params }: { params: { username: string } }) => {

    const user = await getProfileByUsername(params.username)

    if (!user) return notFound();

    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
        getUserPosts(user.id),
        getUserLikedPosts(user.id),
        isFollowing(user.id),
    ]);

    return (
        <ProfilePage use  />
    )
}

export default page