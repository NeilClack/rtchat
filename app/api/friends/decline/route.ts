import fetchRedis from "@/app/lib/Redis/redis";
import authOptions from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {id: idToDecline} = z.object({id: z.string()}).parse(body);

        // ------- Request validations -------
        // deny request if user is not logged in
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", {status: 401})
        }

        // verify the user has a pending friend request from the sender
        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToDecline)

        if(!hasFriendRequest) {
            return new Response("You have not recieved a friend request from this user.", {status: 400})
        }

        // delete friend request
        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDecline)

        // Send response
        return new Response('OK', {status: 200})

    } catch (err) {
        console.log(err)
        if(err instanceof z.ZodError) {
            return new Response("Invalid request payload", {status: 422})
        }
        return new Response("Invalid request", {status: 400})
    }
}