import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import fetchRedis from "./Redis/redis"
import { db } from "./db"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"

const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db) as Adapter,
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async session({ session, user }){

            const dbUserResult = (await fetchRedis('get', `user:${user.id}`)) as string | null

            if(!dbUserResult){
                if(user){
                    session.user.id = user!.id
                }
            }
            
            const dbUser = dbUserResult ? JSON.parse(dbUserResult) : null
            
            if(dbUser) {
                session.user.id = dbUser.id,
                session.user.email = dbUser.email,
                session.user.name = dbUser.name,
                session.user.image = dbUser.picture
            }

            return session
        },
        redirect() {
            return '/dashboard'
        }
    }
}

export default authOptions;
