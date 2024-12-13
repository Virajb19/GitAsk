import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"

export const useProject = () => {

 const [projects,setProjects] = useState<Project[]>([])
 const [projectId, setProjectId] = useLocalStorage<string>('projectId', '')

 const {isLoading, isError} = useQuery({
  queryKey: ['getProjects'],
  queryFn: async () => {
      const id = toast.loading('fetching')
      const { data: { projects }} = await axios.get('/api/project')
      setProjects(projects)
      toast.dismiss(id)
      return projects
  },
 })

 if(isError) toast.error('Some error occured')

 const project = useMemo(() => {
   return projects.find(project => project.id === projectId)
 }, [projects, projectId])

    return { projects, projectId, setProjectId, project, isLoading}
}