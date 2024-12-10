import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { getProjects } from "~/actions/getProjects"

export const useProject = () => {

 const [projects,setProjects] = useState<Project[]>([])
 const [projectId, setProjectId] = useLocalStorage<string>('projectId', '')
//  const [isLoading, setIsLoading] = useState(true)
 const {data,isLoading} = useQuery({
  queryKey: ['getProjects'],
  queryFn: async () => {
      const { data: { projects }} = await axios.get('/api/project')
      setProjects(projects)
      return projects
  },
 })

 const project = useMemo(() => {
   return projects.find(project => project.id === projectId)
 }, [projects, projectId])

    // useEffect(() => {
    //     getProjects().then(({ projects }) => setProjects(projects ?? []))
    //     setIsLoading(false)
    // }, [])

    return { projects, projectId, setProjectId, project, isLoading}
}