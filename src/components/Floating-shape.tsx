'use client'

import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

type Props = {size: string, top: string, left: string, xValues: string[], yValues: string[]}

export default function FloatingShape({size, top, left, xValues, yValues}: Props) {
  return <motion.div animate={{y: yValues, x: xValues, rotate: [0, 360]}} transition={{duration: 20, ease: 'linear', repeat: Infinity, delay: 1}}
   className={twMerge('absolute rounded-full bg-blue-500 -z-20 opacity-60 blur-xl', size,top,left)} 
   aria-hidden={true}
   />   
}