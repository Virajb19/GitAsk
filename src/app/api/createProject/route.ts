import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "~/lib/zod";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
try {

  const session = await getServerAuthSession()
  if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
  const userId = session.user.id

  console.log(session)

    const parsedData = createProjectSchema.safeParse(await req.json())
    if(!parsedData.success) return NextResponse.json({msg: 'Invalid inputs', errors: parsedData.error.flatten().fieldErrors}, { status: 400})
    const { name, repoURL, githubToken } = parsedData.data

    // const project = await db.project.create({data: {name,repoURL,githubToken,userId}})
    await new Promise(res => setTimeout(res, 3000))

    return NextResponse.json({msg: 'Project created successfully', projectId: 10}, { status: 200})

} catch(err) {
    console.error(err)
    return NextResponse.json({msg: 'Error creating the project'}, { status: 500})    
  }
}