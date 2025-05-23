import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo, startIndexing } from "~/lib/github-loader";
import { createProjectSchema } from "~/lib/zod";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { z } from 'zod'
import { checkRepoExists } from "~/server/actions";

const bodySchema = createProjectSchema.extend({
  fileCount: z.number()
})

// export const config = {
//    runtime: 'edge'
// }

export async function POST(req: NextRequest) {
try {

    const session = await getServerAuthSession()
    if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
    const userId = session.user.id

    const body = await req.json()

    const user = await db.user.findUnique({ where: { id: userId}, select: { credits: true}})
    if(!user) return NextResponse.json({msg: 'user not found'}, { status: 404})
    
    // const parsedData = await bodySchema.safeParseAsync(body)
    const parsedData = bodySchema.safeParse(body)
    if(!parsedData.success) return NextResponse.json({msg: 'Invalid inputs', errors: parsedData.error.flatten().fieldErrors}, { status: 400})
    const { name, repoURL, githubToken, fileCount } = parsedData.data

    // const repoExists = await checkRepoExists(repoURL)
    // if (!repoExists) return NextResponse.json({msg: 'This repository does not exist'}, { status: 400})

    if(fileCount > user.credits) return NextResponse.json({msg: 'Insufficient credits'}, { status: 403})

    const existingProject = await db.project.findFirst({where: {repoURL,userId}})
    if(existingProject) return NextResponse.json({msg: 'You already have a project with this repo URL'}, {status: 409})

    // Transaction won't work
    const project = await db.project.create({data: {name,repoURL,githubToken,userId}, select: {id: true, repoURL: true}});

    try {
      await pollCommits(project.id, project.repoURL)
      // await indexGithubRepo(project.id,project.repoURL)
    } catch(err) {
        console.error(err)
        await db.project.delete({where: {id: project.id}})
        return NextResponse.json({msg: 'Error creating the project'}, { status: 500})
    }

    await db.user.update({where: {id: userId}, data: {credits: {decrement: fileCount}}});
    
    // (async () => {
      // try {
      //   await pollCommits(project.id, project.repoURL)
        // startIndexing(project.id, project.repoURL)
      // } catch(err) {
      //     console.error(err)
      //     await db.project.delete({where: {id: project.id}})
      //     return NextResponse.json({msg: 'Error creating the project'}, { status: 500})
      // }
    // }) ()

    return NextResponse.json({msg: 'Project created successfully', projectId: project.id, repoURL: project.repoURL}, { status: 201})

} catch(err: any) {
    console.error('Error creating the project',err)
    if(err instanceof Prisma.PrismaClientKnownRequestError) {
      if(err.code === 'P2002') {
        return NextResponse.json({msg: 'You already have a project with this repo URL'}, {status: 409})
      }
    }
    return NextResponse.json({msg: 'Error creating the project'}, { status: 500})    
  }
}

export async function GET() {
  try {
      const session = await getServerAuthSession()
      if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
      const userId = session.user.id

      // deletedAt: null
      const projects = await db.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc'}})

      return NextResponse.json({projects}, { status: 200})
  } catch(err) {
      console.error('Error getting the projects\n',err)
      return NextResponse.json({msg: 'Error getting the projects'},{ status: 500})
  }
}