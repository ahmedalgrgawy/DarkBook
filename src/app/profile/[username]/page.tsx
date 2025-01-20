import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.actions"
import ProfilePage from "@/Components/ProfilePage"
import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from 'next'


type Props = {
    params: Promise<{ username: string }>
}


export const generateMetadata = async (
    { params }: Props,
): Promise<Metadata> => {

    const username = (await params).username
    const user = await getProfileByUsername(username)
    if (!user) return notFound();

    return {
        title: `${user?.username || user?.name} | Dark-Book`,
    }
}

const Page = async ({ params }: Props) => {

    const username = (await params).username
    const user = await getProfileByUsername(username)

    if (!user) return notFound();

    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
        getUserPosts(user.id),
        getUserLikedPosts(user.id),
        isFollowing(user.id),
    ]);

    return (
        <ProfilePage
            user={user}
            posts={posts}
            likedPosts={likedPosts}
            isCurrentUserFollowing={isCurrentUserFollowing}
        />
    )
}

export default Page