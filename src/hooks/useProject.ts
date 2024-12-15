import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"

export const useProject = () => {

 const {data: session} = useSession()
 const userId = session?.user.id

 const [projects,setProjects] = useState<Project[]>([])
 const [projectId, setProjectId] = useLocalStorage<string>('projectId', '')

 const {isLoading, isError} = useQuery({
  queryKey: ['getProjects', userId],
  queryFn: async () => {
      const { data: { projects }} = await axios.get('/api/project')
      setProjects(projects)
      return projects
  },
 })

 if(isError) toast.error('Some error occured')

 const project = useMemo(() => {
   return projects.find(project => project.id === projectId)
 }, [projects, projectId])


    return { projects, projectId, setProjectId, project, isLoading}
}