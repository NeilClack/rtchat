import { FC } from "react";
import AddFriendButton from "@/app/components/UI/AddFriendButton";

const Page: FC = () => {
  return (
    <h1 className="font-bold text-5xl mb-8">
      <AddFriendButton />
    </h1>
  );
};

export default Page;
