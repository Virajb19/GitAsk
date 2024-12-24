import { useState } from "react";
import { Button } from "./ui/button";
import { Trash, Loader } from 'lucide-react'
import { useProject } from "~/hooks/useProject";
import { archiveProject } from "~/server/actions";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query'

export default function ArchiveButton() {

    const { projectId } = useProject()
    const [loading, setLoading] = useState(false)

    const queryClient =  useQueryClient()

  async function handleClick() {
     setLoading(true)
     const res = await archiveProject(projectId)
     if(res.success) {
        toast.success('Project archived')
        queryClient.refetchQueries({queryKey: ['getProjects']})
     }
     else toast.error(res.msg || 'Failed to archive the project')
     setLoading(false)
  }

  return <Button disabled={loading} onClick={() => {
     const confirm = window.confirm('Are you sure you want to archive this project?')
     if(confirm) handleClick()
  }} variant={'destructive'} className="flex items-center gap-2 text-lg font-semibold">
        {loading ? <Loader strokeWidth={3} className="animate-spin"/> : <Trash strokeWidth={3}/>} 
        {loading ? 'Archiving...' : 'Archive project'}
  </Button>
}