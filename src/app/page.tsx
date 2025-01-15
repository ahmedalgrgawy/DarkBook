import { getPosts } from "@/actions/post.actions";
import { getDbUserId } from "@/actions/user.actions";
import CreatePost from "@/Components/CreatePost";
import PostCard from "@/Components/PostCard";
import SuggestedUsers from "@/Components/SuggestedUsers";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {

  const user = await currentUser()
  const posts = await getPosts()
  const dbUserId = await getDbUserId()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

        <div className="space-y-6">
          {
            posts?.map((post) => {
              return (
                <PostCard key={post.id} post={post} userId={dbUserId} />
              )
            })
          }
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <SuggestedUsers />
      </div>
    </div>
  );
}
