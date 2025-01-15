"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { followUnFollowUser } from "@/actions/user.actions";
import toast from "react-hot-toast";

const FollowButton = ({ userId }: {
    userId: string
}) => {

    const [isLoading, setIsLoading] = useState(false);
    const handleFollow = async () => {
        setIsLoading(true);
        try {
            await followUnFollowUser(userId);
            toast.success("User followed successfully");
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <Button
            size={"sm"}
            variant={"secondary"}
            onClick={handleFollow}
            disabled={isLoading}
            className="w-20"
        >
            {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
        </Button>
    );
}

export default FollowButton