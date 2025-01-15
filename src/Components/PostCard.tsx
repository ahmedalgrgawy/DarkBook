"use client"
import { createComment, deletePost, getPosts, toggleLikes } from "@/actions/post.actions"
import { SignInButton, useUser } from "@clerk/nextjs"
import { useState } from "react"
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";

type Posts = NonNullable<Awaited<ReturnType<typeof getPosts>>>;
type Post = Posts[number];

const PostCard = ({ post, userId }: {
    post: Post,
    userId: string | null
}) => {

    const { user } = useUser();
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiking, setIsLiking] = useState(false)
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
        <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                    <div className="flex space-x-3 sm:space-x-4">
                        <Link href={`/profile/${post.author.username}`}>
                            <Avatar className="size-8 sm:w-10 sm:h-10">
                                <AvatarImage src={post.author.image ?? "/avatar.png"} />
                            </Avatar>
                        </Link>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                                    <Link
                                        href={`/profile/${post.author.username}`}
                                        className="font-semibold truncate"
                                    >
                                        {post.author.name}
                                    </Link>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                                    </div>
                                </div>

                                {userId === post.author.id && (
                                    <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePosts} />
                                )}
                            </div>
                            <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
                        </div>
                    </div>

                    {post.image && (
                        <div className="rounded-lg overflow-hidden">
                            <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="flex items-center pt-2 space-x-4">
                        {user ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                                    }`}
                                onClick={handleLike}
                            >
                                {hasLiked ? (
                                    <HeartIcon className="size-5 fill-current" />
                                ) : (
                                    <HeartIcon className="size-5" />
                                )}
                                <span>{optimizedLikes}</span>
                            </Button>
                        ) : (
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                                    <HeartIcon className="size-5" />
                                    <span>{optimizedLikes}</span>
                                </Button>
                            </SignInButton>
                        )}

                    </div>

                </div>
            </CardContent>
        </Card>
    );
}

export default PostCard