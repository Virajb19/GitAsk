'use client'

import { useProject } from "~/hooks/useProject"
import { ExternalLink, Github } from 'lucide-react'
import Link from "next/link"

export default function DashBoard() {

  const { project } = useProject()

  return <div className="grow flex flex-col gap-1 p-3">
    <div className="flex gap-1 p-1 items-center">
      <div className="flex justify-between gap-3 items-center bg-blue-700 rounded-sm px-5 py-3">
        <Github className="size-6" />
        <p className="flex flex-wrap items-center gap-2 font-semibold">This project is linked to
          <Link href={project?.repoURL ?? ''} className="text-sm text-white/80 hover:underline inline-flex items-center font-light gap-1">
          {project?.repoURL}
          <ExternalLink className="size-4"/>
          </Link>
        </p>
      </div>
    </div>
  </div>
}