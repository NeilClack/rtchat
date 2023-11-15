import ChatInput from "@/app/components/ChatInput";
import Messages from "@/app/components/Messages";
import fetchRedis from "@/app/lib/Redis/redis";
import authOptions from "@/app/lib/auth";
import { messageArrayValidator } from "@/app/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

import React from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

const getChatPartner = async (chatPartnerId: string) => {
  try {
    const chatPartner = (await fetchRedis(
      "get",
      `user:${chatPartnerId}`
    )) as User;

    return chatPartner;
  } catch (error) {
    console.log(error);
  }
};

const getChatMessages = async (chatId: string) => {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    if (!results.length) {
      return [];
    }

    const rawMessages = results.map(
      (message) => JSON.parse(message) as Message
    );
    const reversedRawMessages = rawMessages.reverse();
    const validatedMessages = messageArrayValidator.parse(reversedRawMessages);
    return validatedMessages;
  } catch (error) {
    console.log(error);
    return notFound();
  }
};

const page: FC<PageProps> = async ({ params }) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  const [userId1, userId2] = chatId.split("--");
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;

  // Checks
  // is there a session?
  if (!session) {
    return notFound();
  }

  // is the user part of the chatId?
  if (user.id !== userId1 && user.id !== userId2) {
    return notFound();
  }

  // is there a chatPartner?
  const chatPartner = await getChatPartner(chatPartnerId);

  const initialMessages = await getChatMessages(chatId);

  console.log(`User Image: ${session.user.image}`);

  if (!chatPartner) {
    return notFound();
  }

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h=[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name}'s profile picture`}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        chatId={chatId}
      />
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default page;
