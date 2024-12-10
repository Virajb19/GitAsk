import { Octokit } from 'octokit'
import { summarizeCommit } from './gemini'
import axios from 'axios'
import { Prisma } from '@prisma/client'

 export const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN
 })

type Response = {
   message: string,
   hash: string,
   authorName: string,
   authorAvatar: string,
   date: string
}

export async function getCommits(githubURL: string): Promise<Response[]> {

   const [owner, repo] = githubURL.split('/').slice(-2)
   if(!owner || !repo) throw new Error('Invalid Github URL')
       
    const { data } = await octokit.rest.repos.listCommits({owner,repo})

    const sortedCommits = data.sort((a: any,b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())

       const commits = sortedCommits.slice(0,3).map(commit => ({
        message: commit.commit.message,
        hash: commit.sha,
        authorName: commit.commit.author?.name ?? '',
        authorAvatar: commit.author?.avatar_url ?? '',
        date: commit.commit.author?.date ?? ''
    }))
 
    return commits
 }

export async function pollCommits(projectId: string, tx: Prisma.TransactionClient) {
   const project = await tx.project.findUnique({ where: { id: projectId}, select:{ repoURL: true}})
   if(!project?.repoURL) throw new Error('Project has no github URL')

   const commits = await getCommits(project.repoURL)

   const processedCommits = await tx.commit.findMany({ where: { projectId}})  

   const unprocessedCommits = commits.filter(commit => !processedCommits.some((processedCommit) => processedCommit.hash === commit.hash))

   if(unprocessedCommits.length === 0) return 0

   const responses = await Promise.allSettled(unprocessedCommits.map(async (commit) => {
      const { data } = await axios.get(`${project.repoURL}/commit/${commit?.hash}.diff`, {
       headers: {
          Accept: 'application/vnd.github.v3.diff'
       }
      })
      const summary = await summarizeCommit(data) || ""
      return summary
   }))

   const summaries = responses.map(response => {
       if(response.status === 'fulfilled') return response.value
       else return ""
   })
   
  const Commits = await tx.commit.createMany({
      data: unprocessedCommits.map((commit, i) => ({
         message: commit.message,
         hash: commit.hash,
         authorName: commit.authorName,
         authorAvatar: commit.authorAvatar,
         date: commit.date,
         summary: summaries[i] ?? '',
         projectId
      }))
   })
   return Commits.count
}
