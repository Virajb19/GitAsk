'use client'

import { Commit } from "@prisma/client"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getCommits } from "~/actions/getCommits"
import { useProject } from "~/hooks/useProject"
import { Skeleton } from "./ui/skeleton"

export default function CommitLogComponent() {

  const { projectId, project } = useProject()
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
      getCommits(projectId).then(({ commits }) => setCommits(commits ?? []))
      setIsLoading(false)
  }, [projectId])

  if(commits.length === 0 && !isLoading) return <div className="flex-center border text-3xl sm:text-7xl font-bold tracking-wide rounded-lg border-blue-700 grow">
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
              <div className="flex flex-col gap-2 items-start w-[70vw] bg-accent dark:bg-card p-2 rounded-lg border border-accent">
                   <Link href={`${project?.repoURL}/commits/${commit.hash}`} className="flex gap-3 items-center"> 
                      <span className="font-semibold text-lg">{commit.authorName}</span>
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
               return <div key={i} className="relative flex justify-end gap-3 p-2 m-5">
                       <Skeleton className="h-12 w-12 rounded-full absolute top-2 left-1" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[70vw]" />
                        <Skeleton className="h-4 w-[70vw]" />
                        <Skeleton className="h-[125px] w-[70vw] rounded-xl" />
                      </div>
                 </div>
            })}
          </>
       )}
  </ul>
}