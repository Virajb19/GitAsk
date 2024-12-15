'use client'

import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import UserAccountNav from "./UserAccountNav";
import { motion } from 'framer-motion'

export default function Searchbar() {
  return <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.5, ease: 'easeOut'}}  className="dark:bg-card bg-muted flex px-2 py-1 items-center justify-between rounded-lg">
        <Image src={'/favicon.ico'} alt='logo' width={40} height={40} />
      <div className="flex items-center gap-3 sm:mr-4">
         <ThemeToggle />
         <UserAccountNav />
      </div>
  </motion.div>
}