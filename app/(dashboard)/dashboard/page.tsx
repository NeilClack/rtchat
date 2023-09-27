import { getServerSession } from "next-auth";
import authOptions from "../../lib/auth";

const Dashboard = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  return (
    <>
      <h2>{session?.user.id}</h2>
      <h1>{session?.user.email}</h1>
      <h2>{session?.user.name}</h2>
      <h2>{session?.user.image}</h2>
    </>
  );
};

export default Dashboard;
