'use client'

import { Bot, CreditCard, LayoutDashboard, SidebarOpen, SidebarClose } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from "react";
import SidebarItems from "./Sidebar-items";
import { useMediaQuery } from 'react-responsive';

const items = [
    {title: 'Dashboard', url: '/dashboard', icon: <LayoutDashboard className="size-7"/>},
    {title: 'Q&A', url: '/qa', icon: <Bot className='size-8'/>},
    {title: 'Billing', url: '/billing', icon: <CreditCard className='size-8'/>}
]

const projects = [
    { name: 'Project Alpha' },
    { name: 'Project Beta' },
    { name: 'Project Gamma' },
];


export default function AppSidebar() {

    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    const isMediumToXL = useMediaQuery({
        query: '(min-width: 768px) and (max-width: 1535px)',
      })

    useEffect(() => {
      setIsMounted(true)
    }, [])

    const sidebarVariants = {
        expanded: { width: '20vw' },
        collapsed: { width: '4vw' },
      }

    const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return <>
  <motion.nav initial={false} animate={isMounted && (isCollapsed ? 'collapsed' : 'expanded')} variants={sidebarVariants} transition={{duration: 0.5, type: 'spring', damping: 15, stiffness: 200}}
    className="hidden lg:flex flex-col p-1 min-w-16 fixed left-0 inset-y-0 z-[999] border-r border-primary/10 bg-background dark:bg-background">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-primary/10 p-2">
               <motion.button onClick={toggleCollapse} className="p-3 rounded-lg transition-all duration-300 hover:bg-blue-600/5 hover:text-blue-500">
                   {isCollapsed ? <SidebarClose /> : <SidebarOpen />}
                </motion.button>
                {!isCollapsed && <motion.h2 initial={{ x: 20, opacity: 0, scale: 0.9}} animate={{ x: 0, opacity: 1, scale: 1}} transition={{ duration: 0.5, ease: 'backInOut', delay: 0.5, type: 'spring'}}
                 className="text-3xl xl:text-5xl bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text font-black tracking-tighter text-transparent">
                    GitChat
                    </motion.h2>
                }
            </div>
            <div className="flex flex-col p-1 gap-2">
             <SidebarItems items={items} isCollapsed={isCollapsed}/>
            </div>
          </div>
  </motion.nav>

    <motion.nav initial={{y: 100}} animate={{ y: 0}} transition={{ duration: 0.7, ease: 'easeInOut'}}
     className='flex justify-around items-center p-3 lg:hidden fixed bottom-0 inset-x-0 z-[999] border-t border-primary/10'>
        <SidebarItems items={items} isCollapsed={!isMediumToXL}/>
    </motion.nav>
  </>
}