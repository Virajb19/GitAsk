'use client'

import { Meeting } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MeetingCard from "~/components/MeetingCard";
import { useProject } from "~/hooks/useProject";
import { motion } from 'framer-motion'
import { Check, Loader2} from 'lucide-react'
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";

export default function MeetingPage() {

  const { projectId } = useProject()

  const { data: meetings, isLoading, isError} = useQuery<Meeting[]>({
    queryKey: ['getMeetings', projectId],
    queryFn: async () => {
       try {
           const { data: { meetings }} = await axios.get(`/api/meetings/${projectId}`)
           return meetings
       } catch(err) {
          console.error(err)
          throw new Error('Error fetching meetings')
       }
    },
    staleTime: 30 * 60 * 1000,
    refetchInterval: 4000
  })

  if(isLoading) return <div className="flex flex-col gap-2 grow">
      <MeetingCard />
      <h3 className="font-bold underline text-3xl">All meetings</h3>
         {Array.from({length: 5}).map((_,i) => {
           return <Skeleton key={i} className="h-[10vh]"/>
      })}          
  </div>

  if(isError || !meetings || meetings?.length === 0) return <div className="flex flex-col grow mt-3 p-1 text-2xl">
       <MeetingCard />
      <span className="self-center my-auto">No meetings found. Refresh!!!</span> 
  </div>

  return <div className="w-full flex flex-col p-3 gap-2 mb:p-0">
          <MeetingCard />
          <h3 className="text-3xl underline font-bold">All Meetings</h3>
            <ul className="flex flex-col gap-2 p-1 grow">
               {meetings.map((meeting, i) => {
                  return <motion.li key={meeting.id} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.3, ease: 'easeInOut', delay: i * 0.1}}
                    className="flex items-center justify-between p-2 rounded-lg border bg-white dark:bg-card">
                       <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-3">
                             <h4 className="text-lg font-bold truncate">{meeting.name}</h4>
                               <span className={twMerge("flex items-center px-2 py-1 rounded-full text-white gap-2 text-sm font-semibold", meeting.status === 'PROCESSING' ? 'bg-amber-500' : 'bg-green-700')}>
                                   {meeting.status === 'PROCESSING' ? (
                                     <>
                                         <Loader2 className="animate-spin size-5"/> Processing...
                                     </>
                                   ) : (
                                     <>
                                         <Check /> Processed
                                     </>
                                   )}
                               </span>
                           </div>
                           <div className="flex items-center text-gray-500 gap-2">
                               <span className="whitespace-nowrap text-sm font-semibold">{new Date(meeting.createdAt).toLocaleDateString()}</span>
                               <p className="font-semibold">{} issues</p>
                           </div>
                       </div>

                       <Link href={`/meetings/${meeting.id}`} className="font-bold p-2 rounded-md bg-blue-800">
                          View meeting
                       </Link>
                  </motion.li>
               })}
            </ul>
  </div>
}