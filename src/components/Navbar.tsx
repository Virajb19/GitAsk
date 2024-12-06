'use client'

import { motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {

  return <motion.nav initial={{ opacity: 0, y: -17 }} animate={{ opacity: 1, y: 0 }} transition={{duration: 0.6, type: 'spring', damping: 7, stiffness: 100}} 
    className="fixed top-0 inset-x-0 z-[999] p-3 backdrop-blur-md border-b-2 border-primary/20 bg-background flex justify-between items-center">
      <motion.h2 initial={{ y: -23}} animate={{ y: 0}} transition={{ duration: 0.6, ease: 'backInOut'}}
       className='mb:text-4xl bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text font-black tracking-tighter text-transparent min-[375px]:block'>GitChat</motion.h2>
        <ThemeToggle />
  </motion.nav>
}