import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Searchbar from "~/components/Searchbar";
import  AppSidebar  from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function SideBarLayout({children}: {children: ReactNode}) {

  const session = await getServerAuthSession()
  if(!session?.user) redirect('/signin')
  console.log(session)
  const projects = await db.project.findMany({ where: { userId: session.user.id}})
  console.log(projects)
    
  return <main className="w-full min-h-screen flex gap-3">
          <AppSidebar />
          {/* <div className="flex flex-col gap-1 items-center border-sidebar-border border shadow rounded-md overflow-y-scroll scrollbar-none h-[calc(100vh-6rem)]">
             <Searchbar />
             {children}
            </div>  */}
            <div className="flex flex-col gap-3 p-2 grow">
                <Searchbar />
               {children}
            </div>
    </main>
}