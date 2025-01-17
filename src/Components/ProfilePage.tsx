"use client"

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.actions";
import { followUnFollowUser } from "@/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

type ProfilePageType = {
    user: NonNullable<User>; // it may return null
    posts: Posts,
    likedPosts: Posts,
    isCurrentUserFollowing: boolean
}

const ProfilePage = ({ user, posts, likedPosts, isCurrentUserFollowing: initialIsFollowing }:
    ProfilePageType
) => {

    const { user: currentUser } = useUser();
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
    });
    const isOwnProfile =
        currentUser?.username === user.username ||
        currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

    const handleFollow = async () => {

        if (!currentUser) return

        setIsUpdatingFollow(true);
        try {
            await followUnFollowUser(user.id);
            setIsFollowing(prev => !prev);
        } catch (error) {
            console.log(error);
        } finally {
            setIsUpdatingFollow(false);
        }
    }

    const handleEdit = async () => {
        const formData = new FormData();
        Object.entries(editForm).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const result = await updateProfile(formData);
        if (result.success) {
            setShowEditDialog(false);
            toast.success("Profile updated successfully");
        }
    }

    return (
        <div>

        </div>
    )
}

export default ProfilePage