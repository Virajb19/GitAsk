import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
    try {
        const session = await getServerAuthSession()
        if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
        const userId = session.user.id

        const projects = await db.project.findMany({ where: { userId}, orderBy: { createdAt: 'desc'}})

        return NextResponse.json({projects}, { status: 200})
    } catch(err) {
        console.error(err)
        return NextResponse.json({msg: 'Error getting the projects'},{ status: 500})
    }
}