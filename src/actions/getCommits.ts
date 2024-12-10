'use server'

import { pollCommits } from "~/lib/github"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"

export async function getCommits(projectId: string) {
   try {
    const session = await getServerAuthSession()
    if(!session?.user) return {msg: 'Unauthorized'}

    const commits = await db.commit.findMany({where: { projectId}, orderBy: { date: 'desc'}})
    await pollCommits(projectId)
    return { commits }

   } catch(err) {
     console.error(err)
     return { msg: 'Error getting commits'}
   }
}