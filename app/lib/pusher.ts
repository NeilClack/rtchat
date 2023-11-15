import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

console.log(`PUSHER_KEY: ${process.env.NEXT_PUBLIC_PUSHER_APP_KEY}`)

const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
})

const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    }
)

export { pusherServer, pusherClient }