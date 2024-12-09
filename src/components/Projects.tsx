import { twMerge } from "tailwind-merge";
import { useProject } from "~/hooks/useProject";

export default function Projects() {

const { projects, setProjectId, projectId} = useProject()

  return <div className="flex flex-col gap-2 p-2 max-h-[45vh] border-4 border-blue-900 rounded-xl overflow-y-scroll">
     {projects?.map((project,i) => {
        return <div key={i} onClick={() => setProjectId(project.id)} 
         className={twMerge("flex items-center gap-2 p-2 rounded-lg cursor-pointer border border-blue-900/2", project.id === projectId ? "bg-blue-600/15 border-blue-900" : "hover:bg-blue-600/15 duration-200")}>
              <span className={twMerge("px-3 py-1 border rounded-sm", project.id === projectId && "bg-blue-500 transition-colors")}>{project.name[0]}</span>
              <p className={twMerge("truncate text-base", project.id === projectId && "text-blue-600")}>{project.name}</p>
        </div>
     })} 
  </div>
}