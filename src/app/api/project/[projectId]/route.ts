import { NextRequest, NextResponse } from "next/server";
import { startIndexing } from "~/lib/github-loader";
import { createProjectSchema } from "~/lib/zod";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function DELETE(req: NextRequest, { params }: { params: { projectId: string}}) {
    try {
        const session = await getServerAuthSession()
        if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})

        const { projectId } = params

        const project = await db.project.findUnique({ where: { id: projectId}, select: { id: true}})
        if(!project) return NextResponse.json({msg: 'project not found'}, { status: 404})

        // await db.project.update({ where: { id: project.id}, data: { deletedAt: new Date()}})
        await db.project.delete({ where: { id: project.id}})

        return NextResponse.json({msg: 'Project deleted'}, { status: 200})

    } catch(err) {
        console.error('Error deleting project',err)
        return NextResponse.json({msg: 'Internal server error'}, { status: 500})
    }
}

const bodySchema = createProjectSchema.omit({name: true})

export async function POST(req: NextRequest, { params }: { params: { projectId: string}}) {
    try {
        const session = await getServerAuthSession()
        if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})

        const body = await req.json()

        const { projectId } = params

        const project = await db.project.findUnique({ where: { id: projectId}, select: { id: true}})
        if(!project) return NextResponse.json({msg: 'project not found'}, { status: 404})

        const parsedData = bodySchema.safeParse(body)
        if(!parsedData.success) return NextResponse.json({msg: 'Invalid inputs', errors: parsedData.error.flatten().fieldErrors}, { status: 400})
        const { repoURL } = parsedData.data

        await startIndexing(project.id, repoURL)

        // await db.user.update({where: {id: userId}, data: {credits: {decrement: fileCount}}})

        return NextResponse.json({msg: 'Repository indexed successfully'}, {status: 200})
    } catch(err) {
        console.error('Error while indexing repository\n', err)
        return NextResponse.json({msg: 'Error while indexing repository'}, {status: 500})
    }
}