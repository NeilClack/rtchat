import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import fetchRedis from "./Redis/redis"
import { db } from "./db"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"

const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db) as Adapter,
    session: {
        strategy: "jwt",
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
        async jwt({token, user}) {
            const dbUser = (await fetchRedis(`get`, `user:${token.id}`)) as string | null

            if(!dbUser) {
                if(user) {
                    token.id = user!.id
                }
                return token
            }

            const dbUserParsed = JSON.parse(dbUser);

            return {
                id: dbUserParsed.id,
                name: dbUserParsed.name,
                email: dbUserParsed.email,  
                image: dbUserParsed.image,
            }
        },
        async session({session, token}) {

            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.image as string;
            }

            return session;
        },
        redirect(){
            return '/dashboard'
        }
    }
}

export default authOptions;
