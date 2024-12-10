'use client'

import { ThemeToggle } from "./ThemeToggle";
import UserAccountNav from "./UserAccountNav";
import { motion } from 'framer-motion'

export default function Searchbar() {
  return <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.5, ease: 'easeOut'}}  className="bg-muted flex p-1 items-center justify-between rounded-lg">
      Search bar
      <div className="flex items-center gap-3 border-4">
         <ThemeToggle />
         <UserAccountNav />
      </div>
  </motion.div>
}