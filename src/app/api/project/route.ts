import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";
import { createProjectSchema } from "~/lib/zod";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
try {

  const session = await getServerAuthSession()
  if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
  const userId = session.user.id

    const parsedData = createProjectSchema.safeParse(await req.json())
    if(!parsedData.success) return NextResponse.json({msg: 'Invalid inputs', errors: parsedData.error.flatten().fieldErrors}, { status: 400})
    const { name, repoURL, githubToken } = parsedData.data

    const existingProject = await db.project.findFirst({where: {repoURL,userId}})
    if(existingProject) return NextResponse.json({msg: 'You already have a project with this repo URL'}, {status: 409})

    // const project = await db.$transaction(async tx => {
      const project = await db.project.create({data: {name,repoURL,githubToken,userId}})
      await pollCommits(project.id)
      await indexGithubRepo(project.id,project.repoURL)
      // return project
    // })

    // call checkCredits function security issue

    const { fileCount } = await req.json()

    await db.user.update({where: {id: userId}, data: {credits: {decrement: fileCount}}})

    return NextResponse.json({msg: 'Project created successfully', project}, { status: 200})

} catch(err: any) {
    console.error(err)
    if(err instanceof Prisma.PrismaClientKnownRequestError) {
      if(err.code === 'P2002') {
        return NextResponse.json({msg: 'You already have a project with this repo URL'}, {status: 409})
      }
    }
    // delete the latest project but only if error is in poll commits or index
    return NextResponse.json({msg: 'Error creating the project'}, { status: 500})    
  }
}

export async function GET() {
  try {
      const session = await getServerAuthSession()
      if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
      const userId = session.user.id

      const projects = await db.project.findMany({ where: { userId, deletedAt: null}, orderBy: { createdAt: 'desc'}})

      return NextResponse.json({projects}, { status: 200})
  } catch(err) {
      console.error(err)
      return NextResponse.json({msg: 'Error getting the projects'},{ status: 500})
  }
}