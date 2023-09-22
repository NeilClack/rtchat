import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const Dashboard = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions)

  return <>
    <h1>Dashboard</h1>
  </>
}

export default Dashboard;