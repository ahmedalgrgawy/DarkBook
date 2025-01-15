"use client"
import { createComment, deletePost, getPosts, toggleLikes } from "@/actions/post.actions"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import toast from "react-hot-toast";

type Posts = NonNullable<Awaited<ReturnType<typeof getPosts>>>;
type Post = Posts[number];

const PostCard = ({ post, userId }: {
    post: Post,
    userId: string | null
}) => {

    const { user } = useAuth()
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === userId))
    const [optimizedLikes, setOptimizedLikes] = useState(post._count.likes) // ui update optimization

    const handleLike = async () => {
        if (isLiking) return;

        try {
            setIsLiking(true)
            setHasLiked(prev => !prev)
            setOptimizedLikes(hasLiked ? optimizedLikes - 1 : optimizedLikes + 1)
            await toggleLikes(post.id)
        } catch (error) {
            console.log(error);
        } finally {
            setIsLiking(false)
        }

    }

    const handleAddComment = async () => {
        if (!newComment.trim() || isCommenting) return;

        try {
            setIsCommenting(true)
            const res = await createComment(post.id, newComment)
            if (res?.success) {
                toast.success("Comment posted successfully");
                setNewComment("")
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsCommenting(false)
        }
    }

    const handleDeletePosts = async () => {
        if (isDeleting) return;
        try {
            setIsDeleting(true);
            const result = await deletePost(post.id);
            if (result.success) toast.success("Post deleted successfully");
            else throw new Error(result.error);
        } catch (error) {
            toast.error("Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div>

        </div>
    )
}

export default PostCard