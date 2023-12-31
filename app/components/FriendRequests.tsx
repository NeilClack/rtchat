"use client";

import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState, useEffect } from "react";
import { pusherClient } from "../lib/pusher";
import { toPusherKey } from "../lib/utils";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  const router = useRouter();

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });
    setFriendRequests((state) =>
      state.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };

  const declineFriend = async (senderId: string) => {
    await axios.post("/api/friends/decline", { id: senderId });
    setFriendRequests((state) =>
      state.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests(
        (state) =>
          [...state, { senderId, senderEmail }] as IncomingFriendRequest[]
      );
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here.</p>
      ) : (
        friendRequests.map((request) => {
          return (
            <div key={request.senderId} className="flex gap-4 items-center">
              <UserPlus className="text-black" />
              <p className="font-medium text-lg">{request.senderEmail}</p>
              <button
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                onClick={() => acceptFriend(request.senderId)}
              >
                <Check
                  className="font-semibold text-white w-3/4 h-3/4"
                  aria-label="accept friend request"
                />
              </button>
              <button
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                onClick={() => declineFriend(request.senderId)}
              >
                <X
                  className="font-semibold text-white w-3/4 h-3/4"
                  aria-label="decline friend request"
                />
              </button>
            </div>
          );
        })
      )}
    </>
  );
};

export default FriendRequests;
