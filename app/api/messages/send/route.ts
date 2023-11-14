import fetchRedis from "@/app/lib/Redis/redis";
import authOptions from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { messageValidator } from "@/app/lib/validations/message";

export async function POST(req: Request) {
    try {
        const {text, chatId}: {text: string, chatId: string} = await req.json();
        const session = await getServerSession(authOptions);
        const [userId1, userId2] = chatId.split('--');

        // no session
        if(!session) return new Response('Unauthorized', {status: 401});

        // user is not in chat
        if(session.user.id !== userId1 && session.user.id !== userId2) return new Response('Unauthorized', {status: 401});

        // set friend id to the id that is not yours
        const friendId = session.user.id === userId1 ? userId2 : userId1;

        // check if friend is in friend list
        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[];
        const isFriend = friendList.includes(friendId);
        if(!isFriend) return new Response('Unauthorized', {status: 401});

        // get sender info
        const senderstring = await fetchRedis('get', `user:${session.user.id}`) as string;

        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp: Date.now(),
        };
        const message = messageValidator.parse(messageData);

        await db.zadd(`chat:${chatId}:messages`, {
            score: messageData.timestamp,
            member: JSON.stringify(message),
        });


        return new Response("OK", {status: 200});

    } catch (error) {
        if(error instanceof Error) {
            return new Response(error.message, {status: 400})
        }

        return new Response("Internal server error", {status: 500})
    }
}