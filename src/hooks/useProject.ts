import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"
import { useIsRefetching } from "~/lib/store"

export const useProject = () => {

 const {data: session} = useSession()
 const userId = session?.user.id

 const { isRefetching } = useIsRefetching()

 const [projectId, setProjectId] = useLocalStorage<string>('projectId', '')

 const {data: projects,isLoading, isError, isFetching} = useQuery<Project[]>({
  queryKey: ['getProjects', userId],
  queryFn: async () => {
      try {
        const { data: { projects }} = await axios.get('/api/project')
        // throw new Error('Error fetching projects')
        return projects
      } catch(err) {
        console.error(err)
        throw new Error('Error fetching projects')
      }
  },
  enabled: !!userId,
  refetchInterval: isRefetching ? 15 * 1000 : false
 })

 // USE DATA DIRECTLY FROM THE QUERY DON'T CREATE A LOCAL STATE FOR THE DATA FETCHED

 const projectCount = projects && projects.length

 const project = useMemo(() => {
    return projects?.find(project => project.id === projectId)
 }, [projects, projectId])

//  if(isError) toast.error('Some error occured')

    return { projects, projectId, setProjectId, project, isLoading, isError, projectCount}
}