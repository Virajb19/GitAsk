import { Project } from "@prisma/client"
import { useEffect, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { getProjects } from "~/actions/getProjects"

export const useProject = () => {

 const [projects,setProjects] = useState<Project[]>([])
 const [projectId, setProjectId] = useLocalStorage('projectId', '')

 const project = projects.find(project => project.id === projectId)

    useEffect(() => {
        getProjects().then(({ projects }) => setProjects(projects ?? []))
    }, [])

    return { projects, projectId, setProjectId, project}
}