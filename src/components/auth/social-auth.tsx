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
          signIn(provider === 'github' ? 'github' : 'google', { callbackUrl: "/" });
          toast.success("Signed in successfully");
        } catch (error) {
          toast.error("Something went wrong !!!");
          setLoading(false)
        }
      }}
      disabled={loading}
      whileHover={{ scale: 1.03 }}
      className={twMerge("flex-center gap-5 w-fit mx-auto rounded-xl border px-4 py-2 mb-2", loading && "cursor-not-allowed text-zinc-600 border-zinc-600")}
    >
       {label}
       {provider === 'github' ? <FaGithub className='size-8'/> : <FcGoogle className='size-8'/>}
    </motion.button>
  );
}
  