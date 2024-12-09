'use server'

import { pollCommits } from "~/lib/github"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"

export async function getProjects() {
 try {
    const session = await getServerAuthSession()
    if(!session?.user) return {msg: 'Unauthorized'}
    const userId = session.user.id

    const projects = await db.project.findMany({where: { userId}, orderBy: {createdAt: 'desc'}})
    return { projects }

 } catch(err) {
    console.error(err)
    return {msg: 'Error getting the projects'}
 }
}