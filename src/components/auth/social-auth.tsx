'use client'

import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { FaGithub} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';

export const DemarcationLine = () => (
    <div className="flex items-center my-4">
      <div className="flex-grow h-px bg-gray-300" />
      <span className="px-4 text-sm text-gray-500">or continue with</span>
      <div className="flex-grow h-px bg-gray-300" />
    </div>
  )

export function OAuthButton({label, provider}: {label: string, provider: string}) {
    const [loading,setLoading] = useState(false)
    
  return (
    <motion.button
      onClick={() => {
        try {
          setLoading(true)
          signIn(provider, { callbackUrl: "/" });
          toast.success("Signed in successfully");
        } catch (error) {
          toast.error("Something went wrong !!!");
          setLoading(false)
        }
      }}
      disabled={loading}
      whileHover= {loading ? {} : { scale: 1.04, backgroundColor: '#1e3a8a', borderStyle: 'transparent', color: 'white'}}
      className={twMerge("flex-center gap-4 w-full sm:w-fit mx-auto rounded-xl border border-blue-900 px-4 py-2 mb-2 text-base hover:border-transparent duration-100", loading && "cursor-not-allowed opacity-50")}
    >
       {label}
       {provider === 'github' ? <FaGithub className='size-8'/> : <FcGoogle className='size-8'/>}

    </motion.button>
  )
}
  