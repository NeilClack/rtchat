import { Icon, Icons } from "@/app/components/UI/Icons";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";
import SignOutButton from "@/app/components/UI/SignOutButton";
import authOptions from "@/app/lib/auth";

interface LayoutProps {
  children: ReactNode;
}

export const DashboardLayout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);

  interface SidebarOption {
    id: number;
    name: string;
    href: string;
    Icon: Icon;
  }

  const sidebarOptions: SidebarOption[] = [
    {
      id: 1,
      name: "Add friend",
      href: "/dashboard/add",
      Icon: "UserPlus",
    },
  ];

  if (!session) redirect("/login");

  return (
    <div className="w-full flex h-screen">
      <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-right border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
        </Link>
        <Link href="/dashboard/add">Add a Friend</Link>
        <div className="text-xs font-semibold leading-6 text-gray-400">
          Your Chats
        </div>
        <nav className="flex flex-1 flex-col h-full">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li className="">// chats that the user has</li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md text-sm p-2 leading-6 font-semibold"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon />
                        </span>
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt="Your profile picture"
                  />
                </div>
                <span className="sr-only">Your Profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-sm text-zinc-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen contianer py-16 md:py-12 w-full">
        {children}
      </aside>
    </div>
  );
};

export default DashboardLayout;
