'use client'

import { useProject } from "~/hooks/useProject"
import { ExternalLink} from 'lucide-react'
import Link from "next/link"
import CommitLogComponent from "~/components/commit-log"
import AskQuestionCard from "~/components/ask-question-card"

export default function DashBoard() {

  const { project } = useProject()

  return <div className="w-full flex flex-col gap-1 p-3 mb:p-0">
    <div className="flex gap-1 p-1 items-center">
      <div className="flex justify-between gap-3 items-center bg-blue-700 rounded-sm px-5 py-3">
        {/* <Github className="size-6" /> */}
        <p className="flex flex-wrap items-center gap-2 font-semibold">This project is linked to
          <Link href={project?.repoURL ?? ''} className="text-sm text-white/80 hover:underline inline-flex items-center font-light gap-1">
          {project?.repoURL}
          <ExternalLink className="size-4"/>
          </Link>
        </p>
      </div>
    </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 mt-1">
          <AskQuestionCard />
      </div>

       <CommitLogComponent />
  </div>
}