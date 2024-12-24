'use client'

import { Commit } from "@prisma/client"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useProject } from "~/hooks/useProject"
import { Skeleton } from "./ui/skeleton"
import { formatDistanceToNow} from 'date-fns'
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export default function CommitLogComponent() {

  const { projectId, project } = useProject()
  const [commits, setCommits] = useState<Commit[]>([])

  const { isLoading, isError } = useQuery({
    queryKey: ['getCommits', projectId],
    queryFn: async () => {
         try {
            const { data : { commits }} = await axios.get(`/api/commits/${projectId}`) 
            setCommits(commits)
            return commits
         } catch(err) {
             throw new Error('Error fetching commits')
         }
    },
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true
  })

  // useEffect(() => {
  //    await getCommits(projectId).then({ setCommits(commits)})
  // }, [projectid])

  // if(isLoading) return <div className="flex flex-col grow gap-2 mt-3 p-1">
  //        {Array.from({ length: 15}).map((_,i) => {
  //              return <div key={i} className="relative flex justify-end gap-3 p-2 m-5 grow">
  //                      <Skeleton className="h-12 w-12 rounded-full absolute top-2 left-4" />
  //                     <div className="space-y-2 w-[68vw] flex flex-col">
  //                       <Skeleton className="h-4" />
  //                       <Skeleton className="h-4" />
  //                       <Skeleton className="h-[125px] rounded-xl" />
  //                     </div>
  //                </div>
  //           })}
  // </div>

  if(isError) return <div className="flex-center grow mt-3 p-1 text-2xl">
      No commits found. Refresh!!!
  </div>

  if(!isLoading && commits.length === 0) return <div className="flex-center border text-3xl sm:text-7xl font-bold tracking-wide rounded-lg border-blue-700 grow">
        Select a Project
  </div>

  return <ul className="flex flex-col grow gap-2 mt-3 p-1 rounded-lg">
       {!isLoading ? (
        <>
        {commits.map(commit => {
          return <li key={commit.id} className="relative flex p-1 justify-end">
              <div className="flex-center absolute top-3 left-1">
                <Image src={commit.authorAvatar} alt="userAvatar" width={50} height={50} className="rounded-full"/>     
              </div>
              <div className="relative flex flex-col gap-2 items-start w-[70vw] bg-accent dark:bg-card p-2 rounded-lg border border-accent">
                  <span className="absolute right-2 top-2">{formatDistanceToNow(new Date(commit.date), {addSuffix: true}).replace('about', '')}</span>
                   <Link href={`${project?.repoURL}/commits/${commit.hash}`} className="flex gap-3 items-center"> 
                      <span className="font-semibold text-lg underline">{commit.authorName}</span>
                      <span className="inline-flex items-center text-sm text-gray-500 hover:underline">committed</span>
                      <ExternalLink className="ml-1 size-4"/>
                    </Link>
                 <p className="break-words whitespace-normal font-bold text-lg">{commit.message}</p>
                 <p className="flex flex-col gap-2 text-gray-500 dark:text-gray-400">
                  {commit.summary.split('*').filter(point => !(point.trim() === '')).map((point,i) => {
                    return <p key={i}>* {point.trim()}</p>
                  })}
                 </p> 
              </div>
          </li>
        })}
       </>
       ) : (
          <>
            {Array.from({ length: 15}).map((_,i) => {
                return <div key={i} className="relative flex justify-end gap-3 p-2 m-5 grow">
                          <Skeleton className="h-12 w-12 rounded-full absolute top-2 left-4" />
                            <div className="space-y-2 w-[68vw] flex flex-col">
                              <Skeleton className="h-4" />
                              <Skeleton className="h-4" />
                              <Skeleton className="h-[125px] rounded-xl" />
                            </div>
                     </div>
            })}               
          </>
       )}
  </ul>
}