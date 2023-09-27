import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import fetchRedis from "./Redis/redis"
import { db } from "./db"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"

const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db) as Adapter,
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
        async jwt({ token, user }){
            const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as string | null

            if(!dbUserResult){
                if(user) {
                    token.id = user!.id
                }
            
                return token
            }

            const dbUser = JSON.parse(dbUserResult);
            
            console.log(`JWT funcction in auth.ts/authOptions/callbacks: ${JSON.stringify(dbUser)}`)

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image
            }
        },
        async session({ session, token }){
            
            if(token) {
                session.user.id = token.id,
                session.user.email = token.email,
                session.user.name = token.name,
                session.user.image = token.picture
            }

            console.log(`Session object in auth.ts/authOptions/session: ${JSON.stringify(session)}`)

            return session
        },
        redirect() {
            return '/dashboard'
        }
    }
}

export default authOptions;
