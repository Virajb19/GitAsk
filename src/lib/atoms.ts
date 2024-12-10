import { Project } from '@prisma/client'
import axios from 'axios'
import { atom, selector} from 'recoil'

export const projectsAtom = atom<Project[]>({
    key: 'projects',
    default: selector({
        key: 'projectsSelector',
        get: async () => {
          try{
            const { data: { projects } } = await axios.get(`http://localhost:3000/api/getProjects`, {withCredentials: true})
            return projects ?? []
          } catch(e) {
             return []
          }
        }
      })
})