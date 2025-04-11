import { NextRequest, NextResponse } from "next/server";
import { pollCommits } from "~/lib/github";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest, { params } : { params: { projectId: string}}) {
    try {
        const session = await getServerAuthSession()
        if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})

        const { projectId } = params
        const project = await db.project.findUnique({ where: { id: projectId}, select: { id: true, repoURL: true}})
        if(!project) return NextResponse.json({msg: 'project not found'}, { status: 404})
        
        const commits = await db.commit.findMany({where: { projectId}, orderBy: { date: 'desc'}})
        await pollCommits(project.id, project.repoURL)
    
        return NextResponse.json({commits}, { status: 200})
    } catch(err) {
        console.error('Error getting commits\n',err)
        return NextResponse.json({msg: 'Internal Server error'},{ status: 500})
    }
}