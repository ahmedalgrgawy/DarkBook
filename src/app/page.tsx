import CreatePost from "@/Components/CreatePost";
import SuggestedUsers from "@/Components/SuggestedUsers";
import { currentUser } from "@clerk/nextjs/server";
import { constants } from "buffer";

export default async function Home() {

  const user = await currentUser()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}
      </div>
      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <SuggestedUsers />
      </div>
    </div>
  );
}
