"use client"
import { getPosts, toggleLikes } from "@/actions/post.actions"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

type Posts = NonNullable<Awaited<ReturnType<typeof getPosts>>>;
type Post = Posts[number];

const PostCard = ({ post, userId }: {
    post: Post,
    userId: string | null
}) => {

    const { user } = useAuth()
    const [newComment, setNewComment] = useState("")
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
            setOptimizedLikes(post._count.likes)
            setHasLiked(post.likes.some((like) => like.userId === userId))
        } finally {
            setIsLiking(false)
        }

    }

    const handleAddComment = async () => {

    }

    const handleDeletePosts = async () => {

    }

    return (
        <div>

        </div>
    )
}

export default PostCard