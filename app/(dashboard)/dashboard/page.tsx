import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const Dashboard = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions)

  return <>
    <h1>{session?.user.email}</h1>
  </>
}

export default Dashboard;