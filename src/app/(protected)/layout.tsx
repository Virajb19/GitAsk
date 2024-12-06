import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Searchbar from "~/components/Searchbar";
import  AppSidebar  from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";

export default async function SideBarLayout({children}: {children: ReactNode}) {

  const session = await getServerAuthSession()
  if(!session?.user) redirect('/signin')

  return <main className="w-full min-h-screen flex gap-1 items-center">
          <AppSidebar />
          {/* <div className="flex flex-col gap-1 items-center border-sidebar-border border shadow rounded-md overflow-y-scroll scrollbar-none h-[calc(100vh-6rem)]">
             <Searchbar />
             {children}
            </div>  */}
    </main>
}