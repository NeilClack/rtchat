import { fetchRedis } from "@/app/lib/Redis/redis";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { addFriendValidator } from "@/app/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email)

    const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: 'no-store',
      })

    const data = await RESTResponse.json() as { result: string }
    const idToAdd = data.result

    if (!idToAdd) {
      return new Response('No such user', { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (idToAdd === session?.user.id) {
      return new Response('You cannot add yourself as a friend', { status: 400 })
    }

    // Check if user is already added
    const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1

    if (isAlreadyAdded) {
      return new Response('User already added', { status: 400 })
    }
    // Check if user is already friends
    const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd) as 0 | 1

    if (isAlreadyFriends) {
      return new Response('Already friends with this user', { status: 400 })
    }

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

    return new Response('Friend request sent', { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}