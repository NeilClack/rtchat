import { FC } from "react";
import AddFriendButton from "../../../components/UI/AddFriendButton";

const Page: FC = () => {
  return (
    <main>
      <h1 className="font-bold text-5xl mb-8">
        <AddFriendButton />
      </h1>
    </main>
  );
};

export default Page;
