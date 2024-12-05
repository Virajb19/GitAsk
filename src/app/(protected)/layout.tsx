import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { getServerAuthSession } from "~/server/auth";

export default async function SideBarLayout({children}: {children: ReactNode}) {

  const session = await getServerAuthSession()
  if(!session?.user) redirect('/signin')

  return <SidebarProvider>
     <main className="w-full m-2">
          <div className="bg-sidebar border-sidebar-border border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)]">
             {children}
            </div> 
    </main>
  </SidebarProvider>
}