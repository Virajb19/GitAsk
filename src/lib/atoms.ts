import { Project } from '@prisma/client'
import axios from 'axios'
import { atom, selector} from 'recoil'
import { getProjects } from '~/actions/getProjects'

export const projectsAtom = atom<Project[]>({
    key: 'projects',
    default: selector({
        key: 'projectsSelector',
        get: async () => {
            const { data: { projects } } = await axios.get(`http://localhost:3000/api/getProjects`)
            return projects ?? []
        }
      })
})